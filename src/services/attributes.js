export function createFakeAttribute({ attribute, numericInput }) {
    return {
        id: -1,
        attribute_id:
        attribute.id,
        tag: `${attribute.tag}:${numericInput}`,
        name: `${numericInput}`
    }
}