

import "./comps/core/core.css";
import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/icons/lib/css/blueprint-icons.css";
import "@blueprintjs/select/lib/css/blueprint-select.css"
import "@blueprintjs/popover2/lib/css/blueprint-popover2.css"
import "@blueprintjs/table/lib/css/table.css"
import "react-grid-layout/css/styles.css"
import "react-resizable/css/styles.css"
import { Route, Routes, useLocation, useNavigate } from 'react-router'
import Leftbar from './comps/core/navigation/dashboard/Leftbar'
import { ProtectedAdminRoute, ProtectedRoute } from './comps/core/routes/ProtectedRoute'
import { useEffect, useState } from 'react'
import { checkForTokenInLocalStorage, removeTokenFromLocalStorage } from './services/localstorage'
import Login from './comps/login';
import SubmissionHeader from './comps/submission';
import SubmissionView from './comps/submission/view';
import Topbar from "./comps/core/navigation/dashboard/Topbar";
import NewSubmission from "./comps/submission/new";
import SubmissionHelp from "./comps/submission/help";
import DatasetHeader from "./comps/dataset";
import DatasetOverview from "./comps/dataset/overview";
import PerformanceHeader from "./comps/performance";
import ProteinOverview from "./comps/protein/charts/overview";
import { Link } from "react-router-dom";
import { getAverageAndErrorByGroups, getQuantilesByGroups, normalizeDataToGroup } from "./services/arrays/groupby";
import Welcome from "./comps/welcome";
import Timeline from "./comps/dataset/timeline";
import Register from "./comps/register";
import PerformanceOverview from "./comps/performance/overview";
import SubmissionStatistics from "./comps/submission/statistics";
import ProteinHeader from "./comps/protein";
import ProteinSelection from "./comps/protein/selection";
import DatasetHeatmap from "./comps/dataset/heatmap";
import DatasetVolcanoPlot from "./comps/dataset/volcano";
import RadialCategoricalScatter from "./comps/core/charts/radialscatter";
import PTM from "./comps/ptm";
import { ScatterPlot } from "./comps/core/charts/scatter";
import InitialSubmission from "./comps/submission/new/InitialSubmission";
import DatasetQC from "./comps/dataset/qc";
import DatasetPCA from "./comps/dataset/pca";
import AdminHeader from "./comps/admin";
import ShareToken from "./comps/admin/ShareToken";
import AdminUsers from "./comps/admin/Users";
import AdminAttributes from "./comps/admin/Attributes";
import { useTokenValid } from "./hooks/queries/login.hooks";
import _ from "lodash"
import Loading from "./comps/core/base/loading";
import DatasetSelection from "./comps/dataset/selection";
import axios from "axios";

//axios defaults

axios.defaults.headers.common['Content-Type'] = 'application/json';

const initAuthenticationStatus = {
  isAuth: false,
  token: "", //logout
  role: 0, //user role encoded as integer. 
  verified: true
}

const initApplicationInfo = {
  app_name: undefined,
  app_description : undefined,
  version: "0.0",
  lead_contact: undefined,
  email : ""
}

function App() {
  const [tokenFromStorage, setTokenFromStorage] = useState(undefined)
  const [authenticationStatus, setAuthenticationStatus] = useState(initAuthenticationStatus)
  const [applicationInfo, setApplicationInfo] = useState(initApplicationInfo)
  const [attributeSearchQuery, setAttributeSearchQuery] = useState("")
  const [submissionsQuery, setSubmissionQuery] = useState({attributes : "", plain : ""})

  const [submissionFilter, setSubmissionFilter] = useState({})
  // check if token is valid, if a token is found in storage.
  const { data: isTokenValid, isSuccess : tokenValidSuccess , isLoading : tokenValidIsLoading, isFetching : tokenValidIsFetching, isFetched : tokenValidIsFetched, isError : tokenValidIsError, error : tokenValidError, } = useTokenValid({tokenString : tokenFromStorage}, {enabled : _.isString(tokenFromStorage) && !authenticationStatus.isAuth})

  const location = useLocation()
  const redirect = useNavigate()
  const basePathName = location.pathname.split("/")[1]
  
  useEffect(() => {
    //check for token in local storage and validate if present
    const { tokenFound, tokenString } = checkForTokenInLocalStorage()
    if (tokenFound) {
      setTokenFromStorage(tokenString)
    }
  }, [])


  useEffect(() => {
    // use effect if token string was found in storage. 
    if (tokenValidIsError && tokenValidError.response.status === 401) {
      logout()
    }
    else if (_.isObject(isTokenValid) && isTokenValid.success) {
      setAuthenticationStatus({
        isAuth: true,
        token: tokenFromStorage,
        role: isTokenValid.role,
        verified: isTokenValid.verified,
        label: isTokenValid.label,
        firstname: isTokenValid.firstname,
        lastname: isTokenValid.lastname
      })

      axios.defaults.headers.common['Authorization'] = `Bearer ${tokenFromStorage}`;

      redirect(location)
    }
  }, [tokenValidSuccess,_.isObject(isTokenValid),tokenValidIsError])

  const logout = () => {
    //logs the user out, deletes the token from local storage. 
    removeTokenFromLocalStorage()
    setAuthenticationStatus(initAuthenticationStatus)
    axios.defaults.headers.common['Authorization'] = `Bearer`;
    redirect("/")
  }

  //console.log(tokenValidIsFetching || tokenValidIsLoading)
  return (
    <div className='dashboard__grid no-scroll'>

      <div className='dashboard__grid__left bg--lightgrey'>
        <Leftbar isAuthenticated={authenticationStatus.isAuth} {...{basePathName}} />
      </div>

      <div className='dashboard__grid__top-row bg--lightgrey'>
        <Topbar {...{basePathName,authenticationStatus,logout}}/>
      </div>

      <div className='dashboard__grid__fill-center'>
      <Routes>
        <Route path="/" element={
            <Login {...{ setAuthenticationStatus}}/>
        } />



      <Route path="/register" element={
          <Register />
        } />

      {/* Redirected after successful login */}
      <Route path="/index" element={
          <ProtectedRoute isAuthenticated={authenticationStatus.isAuth} isLoadingToken={tokenValidIsFetching || tokenValidIsLoading} >
              <Welcome {...{authenticationStatus,applicationInfo, setApplicationInfo}}/>
          </ProtectedRoute>} />

      <Route path="/protein" element={
              <ProtectedRoute isAuthenticated={authenticationStatus.isAuth} isLoadingToken={tokenValidIsFetching || tokenValidIsLoading}>
                <ProteinHeader/>
            </ProtectedRoute>}>
            <Route path="/protein/selection" element={<ProteinSelection {...{authenticationStatus}}/>} />
            <Route path="/protein/:ID" element={<ProteinOverview {...{authenticationStatus}}/>} />
        </Route>

          <Route path="/ptm" element={
          <ProtectedRoute isAuthenticated={authenticationStatus.isAuth} isLoadingToken={tokenValidIsFetching || tokenValidIsLoading}>
              <PTM />
            </ProtectedRoute>} />

        <Route path="/dataset/:dataID" element={
          <ProtectedRoute isAuthenticated={authenticationStatus.isAuth} isLoadingToken={tokenValidIsFetching || tokenValidIsLoading}>
              <DatasetHeader {...{authenticationStatus, logout}}/>
            </ProtectedRoute>}>
            <Route path="/dataset/:dataID" element={<DatasetOverview {...{authenticationStatus, logout}}/>} />
            <Route path="/dataset/:dataID/volcano" element={<DatasetVolcanoPlot {...{authenticationStatus, logout}}/>} />
            <Route path="/dataset/:dataID/heatmap" element={<DatasetHeatmap {...{authenticationStatus, logout}}/>} />
            <Route path="/dataset/:dataID/pca" element={<DatasetPCA {...{authenticationStatus, logout}}/>} />
            <Route path="/dataset/:dataID/qc" element={<DatasetQC {...{authenticationStatus, logout}}/>} />
            <Route path="/dataset/:dataID/mitomap" element={<h3>MitoMap</h3>} />
            <Route path="/dataset/:dataID/timeline" element={<Timeline {...{authenticationStatus, logout}}/>} />
            <Route path="/dataset/:dataID/help" element={<div><h3>Datasets Help</h3></div>}/>
          </Route>

      <Route path="/dataset" element={
            <ProtectedRoute isAuthenticated={authenticationStatus.isAuth} isLoadingToken={tokenValidIsFetching || tokenValidIsLoading}>
              <DatasetSelection {...{authenticationStatus, logout, submissionFilter, setSubmissionFilter, submissionsQuery, setSubmissionQuery}}/>
              {/* <div>
                <h3>Datasets Selection</h3>
                <p>Pleaase select a dataset to explore. Tag based search supported.</p>
                <p>Previous selected datasets ...</p>
                <Link to="/dataset/8dlTWpi5MMhF">Dataset1</Link>
                <ScatterPlot width={400} height={300} data={[{"x":2,"y":3},{"x":4,"y":5}]} xaxisName={"x"} yaxisName={"y"} />
              </div> */}
              
          </ProtectedRoute>} />
        {/* Performance Routes */}
      <Route path="/performance" element={
          <ProtectedRoute isAuthenticated={authenticationStatus.isAuth} isLoadingToken={tokenValidIsFetching || tokenValidIsLoading}>
              <PerformanceHeader />
            </ProtectedRoute>}>
            
            <Route index element={<PerformanceOverview />} />
            <Route path="/performance/overview" element={<PerformanceOverview />} />
            <Route path="/performance/runs" element={
              <div>
               
              </div>} />
            
            <Route path="/performance/help" element={<h3>Help</h3>}/>
        </Route>
      
        
          {/* Submission Routes */}
      <Route path="/submission" element={
            <ProtectedRoute isAuthenticated={authenticationStatus.isAuth} isLoadingToken={tokenValidIsFetching || tokenValidIsLoading}>
              <SubmissionHeader/>
            </ProtectedRoute>
          }>
            <Route index element={<NewSubmission {...{authenticationStatus, logout}}/>} />
            <Route path="/submission/new" element={<InitialSubmission {...{authenticationStatus, logout}}/>}/>
            <Route path="/submission/view" element={<SubmissionView {...{authenticationStatus, logout, submissionFilter, setSubmissionFilter, submissionsQuery, setSubmissionQuery}}/>}/>
            <Route path="/submission/a" element={<h3>Submission Overview</h3>}/>
            <Route path="/submission/help" element={<SubmissionHelp authStatus={authenticationStatus} />} />
            <Route path="/submission/statistics" element={
              <SubmissionStatistics {...{authenticationStatus, logout, submissionFilter, setSubmissionFilter, submissionsQuery, setSubmissionQuery}}/>} />
      </Route>
      
      <Route path="/admin" element={
          <ProtectedAdminRoute isAuthenticated={authenticationStatus.isAuth} isAdmin={authenticationStatus.role === 4}>
              <AdminHeader {...{authenticationStatus}}/>
            </ProtectedAdminRoute>
          }>
            <Route index element={<div>Admin Settings</div>} />
            <Route path="/admin/users" element={<AdminUsers {...{authenticationStatus}}/>}/>
            <Route path="/admin/sharetoken" element={<ShareToken {...{authenticationStatus}}/>}/>
            <Route path="/admin/attributes" element={<AdminAttributes {...{authenticationStatus}}/>}/>
            </Route>
          

          <Route path="/contact" element={
            <div><h3>Contact</h3>
              <p>Please utilize the discussion and issue sections of the <a href="https://github.com/hnolcol/mitocube"><span className="h1-span">github</span></a> repository for requestion new web application features.</p>
            </div>} />
             
        
      </Routes>
        

        
      </div>
      
    </div>
  )
}

export default App
