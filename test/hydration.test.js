import { h, app } from "../src"

window.requestAnimationFrame = setTimeout

test("hydrate from SSR", done => {
  //
  // Let's suppose this HTML was rendered on the server.
  //
  document.body.innerHTML = `<div id="foo" data-ssr><div id="bar">Baz</div></div>`

  app({
    view: state =>
      h(
        "div",
        {
          id: "foo"
        },
        [
          h(
            "div",
            {
              id: "bar"
            },
            ["Baz"]
          )
        ]
      ),
    events: {
      render(state, actions, view) {
        //
        // This event fires immediately before calling the view and patch
        // with the new vtree, but because patch is sync, setTimeout will
        // run this test after the DOM has been modified.
        //
        setTimeout(function() {
          expect(document.body.innerHTML).toBe(
            `<div id="foo"><div id="bar">Baz</div></div>`
          )
          done()
        })

        return view
      }
    }
  })
})

test("hydrate from SSR with out-of-date text node", done => {
  document.body.innerHTML = `<div id="foo" data-ssr>Foo</div>`

  app({
    view: state => h("div", { id: "foo" }, "Bar"),
    events: {
      render(state, actions, view) {
        setTimeout(function() {
          expect(document.body.innerHTML).toBe(`<div id="foo">Bar</div>`)
          done()
        })

        return view
      }
    }
  })
})

test("hydrate from SSR with a root", done => {
  document.body.innerHTML = `<div id="app"><div id="foo" data-ssr>Foo</div></div>`

  app({
    view: state => h("div", { id: "foo" }, ["Foo"]),
    root: document.getElementById("app"),
    events: {
      render(state, actions, view) {
        setTimeout(() => {
          expect(document.body.innerHTML).toBe(
            `<div id="app"><div id="foo">Foo</div></div>`
          )
          done()
        })

        return view
      }
    }
  })
})
