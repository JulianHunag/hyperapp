import { h, app } from "../src"

function expect(s) {
  console.log("============================")
  console.log("  " + s)
  console.log("============================")
  return global.expect(s)
}

window.requestAnimationFrame = setTimeout

beforeEach(() => (document.body.innerHTML = ""))

test("load", done => {
  app({
    view: state => "",
    state: {
      number: 1
    },
    actions: {
      up(state) {
        return {
          number: state.number + 1
        }
      }
    },
    events: {
      load(state, actions) {
        actions.up()
      },
      update(state, actions, nextState) {
        expect(state.number).toBe(1)
        expect(nextState.number).toBe(2)
        done()
      }
    }
  })
})


test("action", done => {
  app({
    state: "",
    view: state => h("div", null, state),
    actions: {
      set: (state, actions, data) => data
    },
    events: {
      init(state, actions) {
        actions.set("foo")
      },
      loaded() {
        expect(document.body.innerHTML).toBe(`<div>bar</div>`)
        done()
      },
      action(state, actions, { name, data }) {
        if (name === "set") {
          return  "bar"
        }
      }
    }
  })
})

test("resolve", done => {
  app({
    state: "",
    view: state => h("div", null, state),
    actions: {
      set: (state, actions, data) => "bar"
    },
    events: {
      init: (state, actions) => {
        actions.set("foo")
      },
      loaded: () => {
        expect(document.body.innerHTML).toBe(`<div>baz</div>`)
        done()
      },
      resolve: (state, actions, { name, data }) => {
        if (name === "set") {
          return { data: "baz" }
        }
      }
    }
  })
})

test("update", done => {
  app({
    state: 1,
    view: state => h("div", null, state),
    actions: {
      add: state => state + 1
    },
    events: {
      init(state, actions) {
        actions.add()
      },
      loaded() {
        expect(document.body.innerHTML).toBe(`<div>20</div>`)
        done()
      },
      update(state, actions, data) {
        return data * 10
      }
    }
  })
})

test("render", done => {
  app({
    state: 1,
    view: state => h("div", null, state),
    events: {
      loaded() {
        expect(document.body.innerHTML).toBe(`<main><div>1</div></main>`)
        done()
      },
      render(state, actions, view) {
        return state => h("main", null, view(state, actions))
      }
    }
  })
})

test("custom event", () => {
  const emit = app({
    view: state => "",
    events: {
      foo(state, actions, data) {
        expect("foo").toBe(data)
      }
    }
  })

  emit("foo", "foo")
})

test("nested action name", () => {
  app({
    view: state => "",
    state: "",
    actions: {
      foo: {
        bar: {
          set: (state, actions, data) => data
        }
      }
    },
    events: {
      init(state, actions) {
        actions.foo.bar.set("foobar")
      },
      action(state, actions, { name, data }) {
        expect(name).toBe("foo.bar.set")
        expect(data).toBe("foobar")
      }
    }
  })
})
