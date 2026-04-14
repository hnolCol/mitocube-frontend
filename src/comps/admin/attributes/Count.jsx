import { api } from "@/api"


export function AttributeCount() {
    const { data: attribute_count, isSuccess } = api.attributes.queryAttributes.useGetAttributeCount();

    return <span>{isSuccess ? attribute_count : null}</span>;
}