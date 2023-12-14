# mitocube-frontend
 
 React / Vite based frontend of the web application MitoCube. Facilitates sample managment and data anaylsis of omics data such as proteomics. The suitable backend can be found (here)[https://github.com/hnolcol/mitocube-backend] and is written in Python. 

## Installation and deployment

Please first download nodejs, vite and yarn. Clone the repository to your favorite folder. 
To install required packages, use

```
cd mitocube-frontend 
yarn install
```
which will install all the required packages. 
For development, use
```
yarn dev
```
to start the frontend. However for deployment, we recommend to use build. Please  follow see the (installation documentation)[https://github.com/mitocube] in the main repository. 
```
yarn build 
```

## Function desgin convention

Functions with a single argument are defined as 
```javascript
/**
 * @description 
 * @param {String} param - Cool definition
 * @returns {String} - What exactly does the function return.
 */
function coolName(param) {
    ....
    return param
}
```

If the function takes multiple params, please use:
```javascript
/**
 * @description 
 * @param {Object} props - Cool definition
 * @param {String} props.param01 - Param 01 def
 * @param {String} props.param02 - Param02 def 
 * @returns {String} - What exactly does the function return.
 */
function coolName({param01, param02}) {
    ....
    return `${param01}-${param02}`
}
```



## Licence 

The MitoCube application is published under the MIT licence. 


## Contact

Please use the issue and discussion of this repository for feedback, feature requests and issues.

## Citation

If you are using MitoCube to manage your omic facility, we would be very happy if you cited us (paper in preparation).


## Developers


