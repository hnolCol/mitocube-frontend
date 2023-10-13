import { useState } from "react";
import { Header } from "../Header";

import {motion } from "framer-motion"
import MetricTable from "../metrictable";
import { getColorPalette } from "../../colors/colorPalette";

const variantsHeader = {
    hidden: {
        maxHeight : "2rem"
    },
    visible : {
        maxHeight : "18rem"
    }
}

const variantsValue = {
    hidden: {
        maxHeight : "1.75rem"
    },
    visible : {
        maxHeight : "18rem"
    }
}

export function AttributeHeader({name, addStringToName = "", ...rest}) {
    const [isOpen, setIsOpen] = useState(false)
    const additionalMetrices = Object.keys(rest).map(keyName => {return {value : rest[keyName] ,name : keyName}}) 
    return (<motion.div
        className="padding--little div-border-bottom intent-margin-left--little intent-margin-right--little"
        style={{overflowY:"hidden"}}
        variants={variantsHeader}
        initial="hidden"
        animate={isOpen ? "visible" : "hidden"}>
        <motion.div whileHover={{ x: 5 }} transition={{ duration: 0.4, scale: 1.1 }} onClick={() => setIsOpen(!isOpen)}>
            <Header text={`${name} ${addStringToName}`} /></motion.div>
            <div className="container--scroll-y-hide-x div--expand">
            <MetricTable data={additionalMetrices} /></div>  
    </motion.div>)
}


export function AttributeValue({name, ...rest}) {
    const [isOpen, setIsOpen] = useState(false)
    const additionalMetrices = Object.keys(rest).map(keyName => {return {value : rest[keyName] ,name : keyName}}) 
    return <motion.div
            className="bg--grey div--round padding--little margin--little"
        style={{overflowY:"hidden"}}
        variants={variantsValue}
        initial="hidden"
        animate={isOpen ? "visible" : "hidden"}>
        <motion.div whileHover={{ x: 1 }} transition={{ duration: 0.4, delay : 0.2}} onClick={() => setIsOpen(!isOpen)}>
            <Header text={`${name}`} fontSize={"1rem"} hexColor={isOpen?getColorPalette(2)[1]:"#000000"} fontWeight={isOpen?550:350}/></motion.div>
        
            <div className="container--scroll-y-hide-x div--expand bg--grey">
                    <MetricTable data={additionalMetrices} /></div>
        
    </motion.div>

}