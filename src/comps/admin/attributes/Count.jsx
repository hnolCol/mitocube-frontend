import hooks from "@mitocube/api-hooks";


export function AttributeCount() {
    const { data: attribute_count, isSuccess } = hooks.attributes.useGetAttributeCount();

    return <span>{isSuccess ? attribute_count : null}</span>;
}