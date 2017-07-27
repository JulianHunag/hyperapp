import { h, app } from "../src"

window.requestAnimationFrame = f => f()

beforeEach(() => (document.body.innerHTML = ""))

const mockDelay = () => new Promise(resolve => setTimeout(resolve, 50))

test("namespaces", () => {
  app({
    view: state => "",
    actions: {
      foo: {
        bar: {
          baz(state, actions, data) {
            expect(data).toBe("foo.bar.baz")
          }
        }
      }
    },
    events: {
      load(state, actions) {
        actions.foo.bar.baz("foo.bar.baz")
      }
    }
  })
})

test("sync updates", () => {
  app({
    view: state => h("div", {}, state.number),
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
        expect(document.body.innerHTML).toBe(`<div>2</div>`)
      }
    }
  })
})

test("async updates", done => {
  app({
    view: state => h("div", {}, state.number),
    state: {
      number: 2
    },
    actions: {
      up(state, actions, data) {
        return {
          number: state.number + data
        }
      },
      upAsync(state, actions, data) {
        return mockDelay().then(() => {
          actions.up(data)
          expect(document.body.innerHTML).toBe(`<div>3</div>`)
          done()
        })
      }
    },
    events: {
      load(state, actions) {
        actions.upAsync(1)
      }
    }
  })
})

test("thunks", done => {
  app({
    view: state => h("div", {}, state.number),
    state: {
      number: 3
    },
    actions: {
      upAsync(state, actions, data) {
        return update => {
          mockDelay().then(() => {
            update({
              number: state.number + data
            })
            expect(document.body.innerHTML).toBe(`<div>4</div>`)
            done()
          })
        }
      }
    },
    events: {
      load(state, actions) {
        actions.upAsync(1)
      }
    }
  })
})

test("thunks + promises", done => {
  app({
    view: state => h("div", {}, state.number),
    state: {
      number: 4
    },
    actions: {
      upAsync(state, actions, data) {
        return mockDelay().then(() => ({
          number: state.number + data
        }))
      }
    },
    events: {
      load(state, actions) {
        actions.upAsync(1)
      },
      resolve(state, actions, result) {
        return result && typeof result.then === "function"
          ? update => result.then(mockUpdate(update))
          : result
      }
    }
  })

  function mockUpdate(cb) {
    return data => {
      cb(data)
      expect(document.body.innerHTML).toBe(`<div>5</div>`)
      done()
    }
  }
})
