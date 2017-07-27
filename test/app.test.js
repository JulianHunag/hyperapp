import { h, app } from "../src"

window.requestAnimationFrame = setTimeout

//
// Be sure to clean up the mess before each test.
//
beforeEach(() => (document.body.innerHTML = ""))

test("throttling", done => {
  app({
    view: state => h("div", {}, state.data),
    state: {
      data: 1
    },
    actions: {
      up(state) {
        return {
          data: state.data + 1
        }
      },
      upAll(state, actions) {
        actions.up()
        actions.up()
        actions.up()
        actions.up()
      }
    },
    events: {
      load(state, actions) {
        actions.upAll()
      },
      render(state, actions, view) {
        setTimeout(() => {
          //
          // If we didn't throttle renders, we'd expect this
          // event to fire for each call to actions.up().
          //
          expect(document.body.innerHTML).toBe("<div>5</div>")
          done()
        })

        //
        // Be sure to return a view when using the render event.
        //
        return view
      }
    }
  })
})

test("interop", done => {
  const { state, actions } = app({
    view: state => h("div", {}, state.data),
    state: {
      data: "foo"
    },
    actions: {
      setData: (state, actions, data) => ({ data })
    },
    events: {
      load(state, actions) {
        //
        // Return here whatever you want the app call to return.
        //
        return {
          state,
          actions
        }
      }
    }
  })

  expect(state.data).toBe("foo")

  actions.setData("bar")

  setTimeout(() => {
    expect(document.body.innerHTML).toBe(`<div>bar</div>`)
    done()
  })
})
