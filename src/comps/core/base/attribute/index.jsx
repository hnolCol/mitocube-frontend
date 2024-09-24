import { useState } from "react";
import { motion } from "framer-motion";

import { Alert, Button } from "@blueprintjs/core";

import { Header } from "../Header";
import { useDeleteAttributeValue, useUpdateAttributeValue } from "../../../../hooks/queries/attribute.hooks";
import MetricTable from "../metrictable";

const variantsHeader = {
    hidden: {
        maxHeight : "2rem"
    },
    visible : {
        maxHeight : "25rem"
    }
}

const variantsValue = {
    hidden: {
        maxHeight : "2rem"
    },
    visible : {
        maxHeight : "28rem"
    }
}

export function AttributeHeader({text, addStringToName = "", ...rest}) {
    const [isOpen, setIsOpen] = useState(false)
    const additionalMetrices = Object.keys(rest).map(keyName => {return {value : rest[keyName] ,text : keyName}}) 
    return (<motion.div
        className="padding--little div-border-bottom intent-margin-left--little intent-margin-right--little"
        style={{overflowY:"hidden", fontFamily:"Arial"}}
        variants={variantsHeader}
        initial="hidden"
        animate={isOpen ? "visible" : "hidden"}>
        <motion.div whileHover={{ x: 5 }} transition={{ duration: 0.4, scale: 1.1 }} onClick={() => setIsOpen(!isOpen)}>
            <Header text={`${text} ${addStringToName}`} /></motion.div>
            <div className="container--scroll-y-hide-x div--expand">
            <MetricTable data={additionalMetrices} /></div>  
    </motion.div>)
}


export function AttributeValueWithPropsTable({ text, handleEdit, ...rest}) {
    
    const [isOpen, setIsOpen] = useState(false)
    const [isWarnOpen, setWarnOpen] = useState(false)
    const additionalMetrices = Object.keys(rest).map(keyName => { return { value: rest[keyName], text: keyName} }) 
    const {mutate : deleteAttributeValue, isLoading, isSuccess } = useDeleteAttributeValue()
    
 

    const handleDelete = () => {
        //delete attribute value by its tag. 
        deleteAttributeValue({attribute_tag : rest.attribute_tag, attribute_value_tag : rest.tag})
    }

    return <motion.div
            className="bg--grey div--round padding--little margin--little"
            style={{overflowY:"hidden", fontFamily : "Arial"}}
            variants={variantsValue}
            initial="hidden"
            animate={isOpen ? "visible" : "hidden"}>
        <Alert
            isOpen={isWarnOpen}
            canEscapeKeyCancel
            confirmButtonText="Delete"
            cancelButtonText="Cancel"
            onConfirm={() => handleDelete(rest.tag)} onClose={() => setWarnOpen(false)}>

            <p>Please confirm that you want to remove the attribute value {rest.text} from the database. All submissions that are connected to this, will lose the relationship. It is not recommended to delete a node!</p>

        </Alert>
        <motion.button
            style={{ outline: "none", border: "none", backgroundColor: "transparent", width: "100%", textAlign : "left", paddingLeft : "1rem"}}
            whileHover={{backgroundColor : "#fff", }}
            onClick={() => setIsOpen(!isOpen)}>
            <Header text={`${text}`} fontSize={"0.85rem"} hexColor={"#000000"} fontWeight={350} />
        </motion.button>

        <div className="container--scroll-y-hide-x div--expand bg--grey">
            <div><Button icon="trash" small minimal intent="danger" onClick={() => setWarnOpen(true)} loading={isLoading} />
                <Button icon="edit" small minimal onClick={handleEdit} />
            </div>
                    <MetricTable data={additionalMetrices} /></div>
        
    </motion.div>

}