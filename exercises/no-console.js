// eslint exercise 3 (no-console)
// When you're finished with this exercise, run
//   "npm start exercise.eslint.4"
//   to move on to the next exercise

const disallowedMethods = ['log', 'info', 'warn', 'error', 'dir']

const aliases = []
function isAlias(value) {
  return aliases.some(alias => alias === value)
}

module.exports = {
  meta: {
    schema: [
      {
        type: 'object',
        properties: {
          allowedMethods: {
            type: 'array',
            items: {
              enum: disallowedMethods,
            },
          },
        },
      },
    ],
  },
  create(context) {
    return {
      Identifier(node) {
        if (
          !looksLike(node, {
            name: value => value === 'console' || isAlias(value),
            parent: {
              type: 'MemberExpression',
              parent: {type: 'CallExpression'},
              property: {
                name: value => {
                  const allowedMethods = (context.options[0] || {})
                    .allowedMethods || []
                  return (
                    disallowedMethods.includes(value) &&
                    !allowedMethods.includes(value)
                  )
                },
              },
            },
          })
        ) {
          return
        }
        context.report({
          node: node.parent.property,
          message: 'Using console is not allowed',
        })
      },
      VariableDeclarator(node) {
        if (node.init.name === 'console' || isAlias(node.init.name)) {
          aliases.push(node.id.name)
        }
      },
      AssignmentExpression(node) {
        const aliasIdx = aliases.findIndex(alias => alias === node.left.name)
        if (
          aliasIdx >= 0 &&
          node.right.name !== 'console' &&
          !isAlias(node.right.name)
        ) {
          aliases.splice(aliasIdx, 1)
        }
      },
    }
  },
}

function looksLike(a, b) {
  return (
    a &&
    b &&
    Object.keys(b).every(bKey => {
      const bVal = b[bKey]
      const aVal = a[bKey]
      if (typeof bVal === 'function') {
        return bVal(aVal)
      }
      return isPrimitive(bVal) ? bVal === aVal : looksLike(aVal, bVal)
    })
  )
}

function isPrimitive(val) {
  return val == null || /^[sbn]/.test(typeof val)
}
