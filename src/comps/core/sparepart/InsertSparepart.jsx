import hooks from "@mitocube/api-hooks";
import { useEffect, useState } from "react";
import _ from "lodash";
import APIError from "../error/APIerror";

const INITIAL_SPAREPART = { tag: "", text: "", description: "", company: "", product_id: "", price: "", link: ""  };

/**
 * Insert / Edit sparepart Component
 */
export function InsertEditSparePart({ 
    onClose,
    isEditing = false,
    tag,
    preText = "",
    preDescription = "",
    preCompany = "",
    preProduct_id = "",
    prePrice = "",
    preLink = "",
}) {
    
    const [sparepart, setSparepart] = useState(INITIAL_SPAREPART);
    const {mutate : postSparePart, isLoading, isError, error, isSuccess} = hooks.maintenance.spareparts.usePostSparePart({
        onSuccess: () => {
            setSparepart(INITIAL_SPAREPART);
        },
    });
    const {mutate : updateSparePart, isLoading : isUpdateLoading} = hooks.maintenance.spareparts.useUpdateSparePart()

    useEffect(() => {
        if (isEditing) {
            setSparepart({
                text: preText,
                description: preDescription,
                company: preCompany,
                product_id: preProduct_id,
                price: prePrice,
                link: preLink
            });
        }
    }, [isEditing, preText, preDescription, preCompany, preProduct_id, prePrice, preLink]);


    const insertSparepart = () => {

        const data = {
            text: sparepart.text,
            description: sparepart.description,
            company: sparepart.company,
            product_id: sparepart.product_id,
            price: sparepart.price,
            link: sparepart.link
        };

        postSparePart(data, {
            onSuccess: () => {
                setSparepart(INITIAL_SPAREPART);
                onClose(true);
            },
            onError: (err) => {
                console.error("Failed to insert spare part", err)
            }
        });
    };

    const editSparepart = () => {
       const data = {
            tag,
            text: sparepart.text,
            description: sparepart.description,
            company: sparepart.company,
            product_id: sparepart.product_id,
            price: sparepart.price,
            link: sparepart.link
       };

       updateSparePart(data, {
            onSuccess: () => onClose(),
            onError: (err) => {
                console.error("Failed to edit spare part.", err)
            }
        });
    };



    return (
        <div className="flex flex-column div--expand margin--medium padding--medium" style={{ gap: "0.4rem"}} overflowY="scroll">
            <h3>{isEditing ? "Spare part Editing" : "Spare part Insertion"}</h3>
            

            <div className="flex flex-column" style={{ gap: "0.5rem" }}>
                <input className="text-input" type="text" value={sparepart.text} placeholder="Enter text" onChange={(e) => setSparepart((prev) => ({ ...prev, text: e.target.value }))} />
                <input className="text-input" type="text" value={sparepart.description} placeholder="Enter description" onChange={(e) => setSparepart((prev) => ({ ...prev, description: e.target.value }))} />
                <input className="text-input" type="text" value={sparepart.company} placeholder="Enter company" onChange={(e) => setSparepart((prev) => ({ ...prev, company: e.target.value }))} />
                <input className="text-input" type="text" value={sparepart.product_id} placeholder="Enter product ID" onChange={(e) => setSparepart((perv) => ({ ...perv, product_id: e.target.value }))} />
                <input className="number-input" type="text" value={sparepart.price} placeholder="Enter price" onChange={(e) => setSparepart((perv) => ({ ...perv, price: e.target.value }))} />
                <input className="text-input" type="text" value={sparepart.link} placeholder="Enter link" onChange={(e) => setSparepart((perv) => ({ ...perv, link: e.target.value }))} />

            </div>

            <div className="margin--medium"> {isSuccess && !isEditing ? (<h3 style={{ color: "#68a063" }}>Spare part inserted successfully!</h3>) : null}
            </div>{isError ? <APIError error={error} /> : null}
            
            
            <div className="div--expand flex flex-column" style={{ justifyContent: "space-between" }}>
            <div className="flex justify-end" style={{ gap: "1rem" }}>
                <button className="dialog-button" style={{ backgroundColor: "#ec7160ff" }} onClick={onClose}>Close</button>
                {isEditing ? 
                    <button className="dialog-button" disabled={isUpdateLoading} onClick={editSparepart}>{isUpdateLoading ? "Editing..." : "Edit"}</button> : 
                    <button className="dialog-button" disabled={isLoading} onClick={insertSparepart}>{isLoading ? "Inserting..." : "Insert"}</button> }
                </div>
            </div>
        </div>
    );
}
