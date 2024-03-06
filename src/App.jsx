

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
import { getItemFromLocalStorage, removeItemFromLocalStorage } from './services/localstorage'
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
import Welcome from "./comps/welcome";
import Timeline from "./comps/dataset/timeline";
import Register from "./comps/register";
import PerformanceOverview from "./comps/performance/overview";
import SubmissionStatistics from "./comps/submission/statistics";
import ProteinHeader from "./comps/protein";
import ProteinSelection from "./comps/protein/selection";
import DatasetHeatmap from "./comps/dataset/heatmap";
import DatasetVolcanoPlot from "./comps/dataset/volcano";
import PTM from "./comps/ptm";
import InitialSubmission from "./comps/submission/new/InitialSubmission";
import DatasetQC from "./comps/dataset/qc";
import DatasetPCA from "./comps/dataset/pca";
import AdminHeader from "./comps/admin";
import ShareToken from "./comps/admin/ShareToken";
import AdminUsers from "./comps/admin/Users";
import AdminAttributes from "./comps/admin/Attributes";
import { useTokenValid } from "./hooks/queries/login.hooks";
import _ from "lodash"
import DatasetSelection from "./comps/dataset/selection";
import axios from "axios";
import AddExistingSubmission from "./comps/submission/add";
import Runlist from "./comps/dataset/runlist";
import { AdminGenotypes } from "./comps/admin/genotypes/Genotypes";
import { MitomapNetwork } from "./comps/dataset/mitomap";

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
  const [tokenFromStorage, setTokenFromStorage] = useState({ token: undefined, locationPathName: "/" })
  const [authenticationStatus, setAuthenticationStatus] = useState(initAuthenticationStatus)
  const [applicationInfo, setApplicationInfo] = useState(initApplicationInfo)
  //const [attributeSearchQuery, setAttributeSearchQuery] = useState("")

  // set up filter for datasets/submissions 
  const [submissionsQuery, setSubmissionQuery] = useState({attributes : "", plain : "", minimalView : false})
  const [submissionFilter, setSubmissionFilter] = useState({})

  // check if token is valid, if a token is found in storage.
  const { data: isTokenValid, 
    isSuccess : tokenValidSuccess , 
    isLoading : tokenValidIsLoading, 
    isFetching : tokenValidIsFetching, 
    isError : tokenValidIsError, 
    error : tokenValidError, } = useTokenValid({tokenString : tokenFromStorage.token}, {
      // if a token is found in local storage, then check if but only if the authenticationStatus.isAuth is not yet true.
      enabled : _.isString(tokenFromStorage.token) && !authenticationStatus.isAuth
    })

  const location = useLocation()
  const redirect = useNavigate()
  const basePathName = location.pathname.split("/")[1]
  
  useEffect(() => {
    //check for token in local storage and validate if present
    // store the location.pathname as this useEffect will be called on initial render. 
    // Therfore we have to store this to redirect the user. 
    const { itemFound, itemValue } = getItemFromLocalStorage({ itemName: "token" })
    if (itemFound) {
      setTokenFromStorage({ token: itemValue, locationPathName: location.pathname })
    }
    else {
      setTokenFromStorage(prevValues => { return { ...prevValues, locationPathName: location.pathname }})
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
          token: tokenFromStorage.token,
          role: isTokenValid.role,
          verified: isTokenValid.verified,
          label: isTokenValid.label,
          firstname: isTokenValid.firstname,
          lastname: isTokenValid.lastname
        })
      axios.defaults.headers.common['Authorization'] = `Bearer ${tokenFromStorage.token}`;
      if (tokenFromStorage.locationPathName === "/") {
        redirect("/index")
      }
      else { redirect(tokenFromStorage.locationPathName) }
      }
  }, [tokenValidSuccess,_.isObject(isTokenValid),tokenValidIsError])

  /**
   * @description Logs the user out by deleting the token from local storage and removing the axios default
   * Authorization header. It will also redirect the user to '/' 
   */
  const logout = () => {
    removeItemFromLocalStorage("token")
    setAuthenticationStatus(initAuthenticationStatus)
    setTokenFromStorage({ token: undefined, locationPathName: "/" })
    axios.defaults.headers.common['Authorization'] = `Bearer`;
    redirect("/")
  }

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
            <Login {...{ setAuthenticationStatus, redirectedFrom : tokenFromStorage.locationPathName}}/>
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

        <Route path="/datasets/:dataID" element={
          <ProtectedRoute isAuthenticated={authenticationStatus.isAuth} isLoadingToken={tokenValidIsFetching || tokenValidIsLoading}>
              <DatasetHeader {...{authenticationStatus, logout}}/>
            </ProtectedRoute>}>
            <Route path="/datasets/:dataID" element={<DatasetOverview {...{authenticationStatus, logout}}/>} />
            <Route path="/datasets/:dataID/volcano" element={<DatasetVolcanoPlot {...{authenticationStatus, logout}}/>} />
            <Route path="/datasets/:dataID/heatmap" element={<DatasetHeatmap {...{authenticationStatus, logout}}/>} />
            <Route path="/datasets/:dataID/pca" element={<DatasetPCA {...{logout}}/>} />
            <Route path="/datasets/:dataID/qc" element={<DatasetQC {...{logout}}/>} />
            <Route path="/datasets/:dataID/mitomap" element={<MitomapNetwork />} />
            <Route path="/datasets/:dataID/timeline" element={<Timeline {...{ authenticationStatus, logout }} />} />
            <Route path="/datasets/:dataID/runlist" element={<Runlist />} />
            <Route path="/datasets/:dataID/help" element={<div><h3>Datasets Help</h3></div>}/>
          </Route>

      <Route path="/datasets" element={
            <ProtectedRoute isAuthenticated={authenticationStatus.isAuth} isLoadingToken={tokenValidIsFetching || tokenValidIsLoading}>
              <DatasetSelection {...{logout, submissionFilter, setSubmissionFilter, submissionsQuery, setSubmissionQuery}}/>
              
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
            <Route path="/submission/existing" element={<AddExistingSubmission {...{authenticationStatus, logout}}/>}/>
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
            <Route path="/admin/attributes" element={<AdminAttributes {...{ authenticationStatus }} />} />
            <Route path="/admin/genotypes" element={<AdminGenotypes />}/>
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
