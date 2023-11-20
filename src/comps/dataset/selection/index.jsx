import { useOutletContext } from "react-router";
import APIError from "../../core/error/APIerror";
import { Link } from "react-router-dom";


function DatasetSelection({authenticationStatus, logout}) {



    // if (isError) return <APIError error={error} />
    // if (isLoading) return <div>Loading...</div>


    return (
        <div>
        
           <h3>Dataset Selection</h3>
            <Link to="/dataset/KUbPyK1ASG">Dataset1</Link>
        </div>
    )


}


export default DatasetSelection