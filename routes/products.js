const url = require('url')
const moment = require('moment')

const { end, getPost, generateHTML } = require.main.require('./services/utils')
const { pool } = require.main.require('./db')

const commentsQuery = `
SELECT
    comments.text,
    comments.created,
    comments.id,
    comments.original_id,
    users.id AS user_id,
    users.name,
    originalUsers.name AS orignal_user_name
FROM
    comments
    LEFT JOIN users ON (users.id = comments.user_id)
    LEFT JOIN comments AS originalComments ON (originalComments.id = comments.original_id)
    LEFT JOIN users AS originalUsers ON (originalUsers.id = originalComments.user_id)
WHERE
    comments.product_id = $1
ORDER BY
    comments.created ASC
`

const ownersQuery = `
SELECT
    id,
    name
FROM (
    SELECT
        unnest(products.owners) AS owner
    FROM
        products
    WHERE
        slug = $1) AS products
    LEFT JOIN users ON users.id = products.owner`

module.exports = {
  get: async (req, res) => {
    const { email } = (req.user) ? req.user : {}
    const template = generateHTML({ email })

    try {
      const { pathname: path } = url.parse(req.url)
      const slug = path.slice(10)

      const { rows: owners } = await pool.query(ownersQuery, [slug])
      const { rows } = await pool.query('SELECT id, name, description, url, image, slug FROM products WHERE slug = $1', [slug])
      if (!rows || !rows[0]) return end(req, res, 404, `${template}<div class="alert alert-warning" role="alert">This product is not found. <a href="/">Go back to the homepage</a>.</div>`)

      const product = rows[0]

      let html = `

        <script src="https://cdn.rawgit.com/imsky/holder/master/holder.js"></script>
        <div class="container"><div class="row"><div class="col-md-7 col-sm-12">
          <p class="mt-4 small text-muted">← <a href="/">homepage</a></p>
          <h2 class="fat mt-4"><a style="color: #001836;" target="_blank" href="${product.url}">${product.name}</a></h2>
          <p style="font-size: 120%;">${product.description}</p>
          ${ owners.length ? `<p>${ owners.length === 1 ? 'Creator is' : 'Creators are' } ${owners.map(i => i.name).join(', ')}</p>` : `` }
          ${ product.image ? `<div class="card" style="width: 350px;"><div class="card-img-top"><img style="max-width: 100%;" src="${product.image}" alt="product.name"></div></div>` : `` }


        <p class="mt-5" id="comments" style="font-size: 120%;">Comments</p>
      `

      const { rows: comments } = await pool.query(commentsQuery, [product.id])
      if (comments.length) html += getCommentsHTML(comments, owners.map(i => i.id))
      else html += `<p>No comments yet. Write you experience if you know this product.</p>`

      html += `${ email ? `
        <form method="post" class="mt-5">
          <label for="commentBox1343"><h3>Leave a comment or ask the founder a question</h3></label>
          <div class="form-group">
            <textarea name="comment" class="form-control" id="commentBox1343" rows="4"></textarea>
          </div>
          <button type="submit" class="btn my-primary">Save comment</button>
        </form>

        ` : `<p>You need to be <a href="/login">logged in</a> to comment.</p>` }

        </div></div></div>

        <script>
        var show = function (elem) { elem.style.display = 'block'; };
        var hide = function (elem) { elem.style.display = 'none'; };
        var toggle = function (elem) {
          if (window.getComputedStyle(elem).display === 'block') {
            hide(elem);
            return;
          }
          show(elem);
        }

        document.querySelectorAll('[data-toggle]').forEach(function(toggleElement) {
          toggleElement.addEventListener('click', function(event) {
            event.preventDefault();
            var selector = event.target.getAttribute('data-toggle')
            toggle(document.querySelector(selector))
          }, false);
        })
        </script>
      `

      return end(req, res, 200, template + html)
    } catch (error) {
      console.error(error)
      return end(req, res, 500, `${template}<div class="alert alert-warning" role="alert">Something went wrong. <a href="/">Go back to the homepage</a>.</div>`)
    }
  },

  post: async (req, res) => {
    const { email, id: userId } = (req.user) ? req.user : {}
    const template = generateHTML({ email })

    try {
      const { pathname: path } = url.parse(req.url)
      const slug = path.slice(10)
      const { rows } = await pool.query('SELECT id FROM products WHERE slug = $1', [slug])
      const { id: productId } = (rows && rows[0]) ? rows[0] : null

      if (!productId) return end(req, res, 400, `${template}<div class="alert alert-warning" role="alert">Something is going wrong here #noproduct.</div>`)
      if (!email) return end(req, res, 400, `${template}<div class="alert alert-warning" role="alert">You need to be logged in to comment.</div>`)

      const { comment, original_id: originalId } = await getPost(req)

      if (originalId) {
        await pool.query('INSERT INTO comments (user_id, original_id, text, product_id) VALUES ($1, $2, $3, $4) RETURNING id', [userId, originalId, comment, productId])
      } else {
        const { rows: [ { id: lastCommentId } ] } = await pool.query('INSERT INTO comments (user_id, original_id, text, product_id) VALUES ($1, $2, $3, $4) RETURNING id', [userId, null, comment, productId])
        await pool.query('UPDATE comments SET original_id = $1 WHERE id = $2', [lastCommentId, lastCommentId])
      }

      res.writeHead(302, { Location: `/products/${slug}` })
      return res.end()
    } catch (error) {
      console.error(error)
      return end(req, res, 500, `${template}<div class="alert alert-warning" role="alert">Something went wrong. <a href="/">Go back to the homepage</a>.</div>`)
    }
  }
}

const getCommentsHTML = (comments, ownerIds) => {
  let html = ''
  let deep = 0

  for (const comment of comments) {
    const isReply = comment.id != comment.original_id
    // deep = isReply ? deep + 1 : 0

    const firstLetter = comment.name.slice(0, 1)
    // const gravatar = `https://www.gravatar.com/avatar/${md5(comment.email.trim().toLowerCase())}?s=130&default=404`
    const placeholder = `holder.js/64x64?theme=thumb&bg=f0f9ff&fg=55595c&text=${firstLetter}`

    html += `<div id="comment-${comment.id}" class="media mt-3" ${ isReply ? `style="margin-left: ${ Math.min(deep, 2) * 40 }px;"` : '' }>
      <img class="mr-3" src="${placeholder}" alt="" style="width: 65px; border-radius: 50%;">
      <div class="media-body">
        <h5 class="mt-0">${comment.name} ${ ownerIds.indexOf(comment.user_id) === -1 ? '' : '<span class="badge my-owner">creator</span>' } <small class="text-muted" title="${moment(comment.created).format()}">${moment(comment.created).fromNow()}</small> <img data-toggle="#form-${comment.id}" style="height: 16px; opacity: 0.6;" src="https://cdn2.iconfinder.com/data/icons/freecns-cumulus/16/519627-127_ArrowLeft-512.png"></h5>
        <p>${ isReply ? `<a href="#comment-${comment.original_id}" class="badge my-primary">reply to ${comment.orignal_user_name.split(' ')[0]}</a>` : '' } ${comment.text.split('\n').join('<br>')}</p>
        <form style="display: none;" class="text-right" method="post" id="form-${comment.id}">
          <input type="hidden" name="original_id" value="${comment.id}">
          <textarea name="comment" class="form-control mt-2" id="commentBox1343" rows="3"></textarea>
          <button type="submit" class="mt-2 btn my-primary">Save comment</button>
        </form>
      </div>
    </div>`
  }
  return html
}
