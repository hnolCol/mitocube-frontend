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
            <Link to="/dataset/BuXOSlIl6G">dataset2</Link>
            <Link to="/dataset/rfP4nAAmgA">D3</Link>
            <Link to="/dataset/3QAisvOBk6xz">Test OLD</Link>
        </div>
    )


}


export default DatasetSelection