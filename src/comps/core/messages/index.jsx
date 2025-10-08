import { allKeysInObject } from "../../../services/objects/checks";
import { motion, AnimatePresence } from "framer-motion"
import _ from "lodash"
import "./style.css"
import { useMemo } from "react";
import { Link } from "react-router-dom";

function Message({ title, date, message }) {
    
    return (
        <div className="flex flex-column div--round bg--lightgrey  padding--medium" >
            <div className="flex justify-space-between">
                <div className="h2-span">{title}</div>
                <div>{date}</div>
            </div>
            <div className="intent-margin-toplittle">
                {message}
            </div>
        </div>
    )
}



function Messages({ messages = [{title : "New Dataset online.",date : "02.02.2023",message : "This is an example message", link : "/dataset/asda"}]}) {
    // component to display news and messages 
    // requires an array of objects containg the keys : title, date, message

    const filteredMessages = useMemo(() => _.isArray(messages)?_.filter(messages, m => allKeysInObject({object : m, keyNames : ["title","date","message","link"]})):[],[messages])

    return (
        <div className="message__container flex flex-column">
            <div className="h0-span font-size--large margin-bottom--little">
                News
            </div>
            <AnimatePresence>
            {filteredMessages.length > 0?messages.map((msg, msgIdx) => { 
                return (
                    <motion.div
                        key={msgIdx}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.75, delay: msgIdx * 0.1 }}
                        style={{ marginBottom: '1rem' }}
                    >
                        <Link to={msg.link} className="router-link">
                            <Message {...msg} />
                        </Link>
                    </motion.div>
                    
                )
            }):<p>No news found..</p>}
        </AnimatePresence>
        </div>
    )
}



export default Messages