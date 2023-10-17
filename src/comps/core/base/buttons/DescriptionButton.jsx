import { Header } from "../Header"
import { motion } from "framer-motion"


function DescriptionButton({headerText = "Header" , descriptionItems = ["Sasdasdada","asdadaasd"]}) {
    //a button that allows for a descirption such as When you shoudl
    // click this button. There can be mutliple ones 
    
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