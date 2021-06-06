const components = [
    {
        type: 1,
        components: [
            {
                type: 2,
                custom_id: 'ac',
                label: 'AC',
                style: 4
            },
            {
                type: 2,
                custom_id: '(',
                label: '(',
                style: 1
            },
            {
                type: 2,
                custom_id: ')',
                label: ')',
                style: 1
            },
            {
                type: 2,
                custom_id: '^',
                label: '^',
                style: 1
            },
            {
                type: 2,
                custom_id: 'delete',
                label: 'Delete',
                style: 4
            }
        ]
    },
    {
        type: 1,
        components: [
            {
                type: 2,
                custom_id: '7',
                label: '7',
                style: 2
            },
            {
                type: 2,
                custom_id: '8',
                label: '8',
                style: 2
            },
            {
                type: 2,
                custom_id: '9',
                label: '9',
                style: 2
            },
            {
                type: 2,
                custom_id: '/',
                label: '/',
                style: 1
            },
            {
                type: 2,
                custom_id: ' ',
                label: ' ',
                style: 2,
                disabled: true
            }
        ]
    },
    {
        type: 1,
        components: [
            {
                type: 2,
                custom_id: '4',
                label: '4',
                style: 2
            },
            {
                type: 2,
                custom_id: '5',
                label: '5',
                style: 2
            },
            {
                type: 2,
                custom_id: '6',
                label: '6',
                style: 2
            },
            {
                type: 2,
                custom_id: 'x',
                label: 'X',
                style: 1
            },
            {
                type: 2,
                custom_id: ' ',
                label: ' ',
                style: 2,
                disabled: true
            }
        ]
    },
    {
        type: 1,
        components: [
            {
                type: 2,
                custom_id: '1',
                label: '1',
                style: 2
            },
            {
                type: 2,
                custom_id: '2',
                label: '2',
                style: 2
            },
            {
                type: 2,
                custom_id: '3',
                label: '3',
                style: 2
            },
            {
                type: 2,
                custom_id: '-',
                label: '-',
                style: 1
            },
            {
                type: 2,
                custom_id: ' ',
                label: ' ',
                style: 2,
                disabled: true
            }
        ]
    },
    {
        type: 1,
        components: [
            {
                type: 2,
                custom_id: '.',
                label: '.',
                style: 1
            },
            {
                type: 2,
                custom_id: '0',
                label: '0',
                style: 2
            },
            {
                type: 2,
                custom_id: '=',
                label: '=',
                style: 3
            },
            {
                type: 2,
                custom_id: '+',
                label: '+',
                style: 1
            },
            {
                type: 2,
                custom_id: ' ',
                label: ' ',
                style: 2,
                disabled: true
            }
        ]
    }
]

export async function handleRequest(request: Request): Promise<Response> {
    if (!request.headers.get('X-Signature-Ed25519') || !request.headers.get('X-Signature-Timestamp')) return new Response('', { status: 401 })
    const valid = (await import('discord-interactions')).verifyKey(await request.clone().arrayBuffer(), request.headers.get('X-Signature-Ed25519')!, request.headers.get('X-Signature-Timestamp')!, (await (await import('./constants')).PUBLIC_KEY))
    if (!valid) return new Response('', { status: 401 })


    const interaction = await request.json()

    if (interaction.type === 1) return respond({
        type: 1
    })

    if (interaction.type === 2) return respond({
        type: 4,
        data: {
            content: '```\n \n```',
            components
        }
    })

    if (interaction.type === 3) {

        if (interaction.message.interaction.user.id !== interaction.member.user.id) return respond({
            type: 4,
            data: {
                flags: 64,
                content: 'You have to run the command yourself!'
            }
        })

        let clickedButton: any
        interaction.message.components.forEach((row: any) => {
            row.components.some((button: any) => button.custom_id === interaction.data.custom_id) ? clickedButton = row.components.find((button: any) => button.custom_id === interaction.data.custom_id) : undefined
        })

        let equation = interaction.message.content
            .replace(/```/g, '')
            .replace(/\n/g, '')
            .replace(/.*= /, '')
            .replace(/ /g, '')

        if (equation.includes('Error')) equation = equation
            .match(/\(.+\)/)[0]
            .replace('(', '')
            .replace(')', '')
        || ''

        if (clickedButton.style === 1) return respond({
            type: 7,
            data: {
                content: `\`\`\`\n${equation + clickedButton.custom_id}\n\`\`\``
            }
        })

        if (clickedButton.style === 2) return respond({
            type: 7,
            data: {
                content: `\`\`\`\n${equation + clickedButton.custom_id}\n\`\`\``
            }
        })

        if (clickedButton.style === 3) {

            const { evaluate } = await import('mathjs')

            try {
                const result = evaluate(equation.replace(/x/g, '*')) || 0

                return respond({
                    type: 7,
                    data: {
                        content: `\`\`\`\n${equation} = ${result}\n\`\`\``
                    }
                })
            } catch (e) {
                return respond({
                    type: 7,
                    data: {
                        content: `\`\`\`Error: Invalid Equation${equation ? ` (${equation})` : ''}\`\`\``
                    }
                })
            }

        }

        if (interaction.data.custom_id === 'ac') return respond({
            type: 7,
            data: {
                content: '```\n \n```'
            }
        })

        if (interaction.data.custom_id === 'delete') return respond({
            type: 7,
            data: {
                content: `\`\`\`\n${equation.slice(0, -1) || ' '}\n\`\`\``
            }
        })

        return respond({
            type: 7,
            data: {
                components
            }
        })

    }

    return new Response('')

}

const respond = (response: any) =>
  new Response(JSON.stringify(response), {headers: {'content-type': 'application/json'}})