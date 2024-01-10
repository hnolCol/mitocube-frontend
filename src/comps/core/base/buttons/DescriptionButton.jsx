import { Header } from "../Header"
import { motion } from "framer-motion"



/**
 * @description A button that allows for a descirption such as 'when should the user click this button'. There can be mutliple description Items. They will be listed on the right side in a column flex order.
 * @param {Object} props
 * @param {String} props.headerText - The main text of the button with descriptiion 
 * @param {String[]} props.descriptionItems - The descriptions that should be displayed on the right side. 
 * @returns {Element} - The JSX Element DescriptionButton.
 */
function DescriptionButton({
    headerText = "Header", 
    descriptionItems = ["Sasdasdada","asdadaasd"]}) {

    return (
        <motion.div className="flex flex-column div--round bg--lightgrey padding--medium margin--little" style={{width : 400}} whileHover={{backgroundColor : "#ffffff"}}>
            <div>
                <Header text={headerText} fontWeight={600}/>
            </div>
            <div className="flex justify-end">
                <div className="flex flex-column justify-end" style={{alignItems : "flex-end", rowGap : "0.75em"}}>
                    {descriptionItems.map((itemText, itemIdx) => {
                        return (
                            <div key={`${itemIdx}-descirption-button${headerText}`}>
                                {itemText}
                            </div>)
                    
                    })}
                </div>

            </div>

        </motion.div>
    )
}


export default DescriptionButton