(this["webpackJsonpfira-web"]=this["webpackJsonpfira-web"]||[]).push([[0],{157:function(e,t,n){e.exports={app:"App_app__16eIj"}},165:function(e,t,n){e.exports={ldsEllipsis:"LoadingIndicator_ldsEllipsis__1NuRE","lds-ellipsis1":"LoadingIndicator_lds-ellipsis1__3Vee3","lds-ellipsis2":"LoadingIndicator_lds-ellipsis2__1xuwq","lds-ellipsis3":"LoadingIndicator_lds-ellipsis3__14o4E"}},171:function(e,t,n){e.exports=n(316)},179:function(e,t,n){},205:function(e,t){},207:function(e,t){},22:function(e,t,n){e.exports={progressBar:"Annotation_progressBar__3Zl_I",container:"Annotation_container__uXhm7",queryText:"Annotation_queryText__3rHCG",annotationArea:"Annotation_annotationArea__2Ta-7",annotatePart:"Annotation_annotatePart__1xChs",annotatePartTooltipButton:"Annotation_annotatePartTooltipButton__2vavl",gridStyle:"Annotation_gridStyle__3oqxr",isInRange:"Annotation_isInRange__3cZIU",rangeStart:"Annotation_rangeStart__2a6Nz",buttonContainer:"Annotation_buttonContainer__3MDzj",rateButton:"Annotation_rateButton__M9e2X"}},244:function(e,t){},245:function(e,t){},316:function(e,t,n){"use strict";n.r(t);var a=n(0),r=n.n(a),o=n(62),i=n.n(o),c=n(23),u=(n(179),n(65)),s=n(35),l=n(157),d=n.n(l),f=n(3),m=n.n(f),p=n(33),g=n(20),v=n(70),E=n(45),b=n.n(E),h=n(36),_=n.n(h),N=n(160),x=n.n(N),O=n(161),T=n(162),S=n(169),j=n(68),A=n(163),R=n(170),y=function(e){function t(e,n){var a;return Object(O.a)(this,t),(a=Object(S.a)(this,Object(j.a)(t).call(this))).errorText=void 0,a.status=void 0,a.errorText=e,a.status=n,a.message=e,a}return Object(A.a)(t,e),Object(T.a)(t,[{key:"getResponse",value:function(){return this.errorText}},{key:"getStatus",value:function(){return this.status}},{key:"toString",value:function(){return"HttpException: status=".concat(this.status,", errorText='").concat(this.errorText,"'")}}]),t}(Object(R.a)(Error)),w=function(e){var t=function(t){return function(n){for(var a=arguments.length,r=new Array(a>1?a-1:0),o=1;o<a;o++)r[o-1]=arguments[o];return t.apply(void 0,["[".concat(e,"] ").concat(n)].concat(r))}};return{debug:t(console.debug),info:t(console.info),error:t(console.error),dir:t(console.dir),group:console.group,groupEnd:console.groupEnd}},I=x.a.create({timeout:5e3}),L=w("http.client"),D=function(e){var t;return m.a.async((function(n){for(;;)switch(n.prev=n.next){case 0:return L.info("executing login...",{username:e.username}),n.prev=1,n.next=4,m.a.awrap(I.post("auth/v1/login",e));case 4:return n.abrupt("return",n.sent.data);case 7:if(n.prev=7,n.t0=n.catch(1),L.error("login failed!",n.t0),401!==(null===(t=n.t0.response)||void 0===t?void 0:t.status)){n.next=12;break}throw new y("credentials invalid",401);case 12:throw n.t0;case 13:case"end":return n.stop()}}),null,null,[[1,7]])},P=function(e){var t,n,a;return m.a.async((function(r){for(;;)switch(r.prev=r.next){case 0:L.info("executing refresh...",{refreshRequest:e}),t=1;case 2:if(!(t<=5)){r.next=21;break}return r.prev=3,r.next=6,m.a.awrap(I.post("auth/v1/refresh",e));case 6:return r.abrupt("return",r.sent.data);case 9:if(r.prev=9,r.t0=r.catch(3),L.info("refresh failed for attempt=".concat(t),{error:r.t0}),n=r.t0,t++,!(null===(a=r.t0.response)||void 0===a?void 0:a.status)){r.next=16;break}return r.abrupt("break",21);case 16:if(!(t<=5)){r.next=19;break}return r.next=19,m.a.awrap(J(3e3));case 19:r.next=2;break;case 21:throw L.error("refresh failed!",n),n;case 23:case"end":return r.stop()}}),null,null,[[3,9]])},k=function(e){return m.a.async((function(t){for(;;)switch(t.prev=t.next){case 0:return L.info("executing preload judgements..."),t.prev=1,t.next=4,m.a.awrap(I.post("judgements/v1/preload",null,{headers:{authorization:"Bearer ".concat(e)}}));case 4:return t.abrupt("return",t.sent.data);case 7:throw t.prev=7,t.t0=t.catch(1),L.error("preload judgements failed!",t.t0),t.t0;case 11:case"end":return t.stop()}}),null,null,[[1,7]])},C=function(e,t,n){return m.a.async((function(a){for(;;)switch(a.prev=a.next){case 0:return L.info("executing submit judgement...",{submitJudgementRequest:n}),a.prev=1,a.next=4,m.a.awrap(I.put("judgements/v1/".concat(t),n,{headers:{authorization:"Bearer ".concat(e)}}));case 4:return a.abrupt("return",a.sent.data);case 7:throw a.prev=7,a.t0=a.catch(1),L.error("submit judgement failed!",a.t0),a.t0;case 11:case"end":return a.stop()}}),null,null,[[1,7]])},F=function(e){return m.a.async((function(t){for(;;)switch(t.prev=t.next){case 0:return L.info("executing export of judgements..."),t.prev=1,t.next=4,m.a.awrap(I.get("admin/v1/judgements/export/tsv",{headers:{authorization:"Bearer ".concat(e)}}));case 4:return t.abrupt("return",t.sent.data);case 7:throw t.prev=7,t.t0=t.catch(1),L.error("export of judgements failed!",t.t0),t.t0;case 11:case"end":return t.stop()}}),null,null,[[1,7]])};function J(e){return new Promise((function(t){return setTimeout(t,e)}))}var B,U=n(168),G=n(25),q=n(11),M=w("browser-storage"),W=function(e){M.info("saveUser called",{user:e}),localStorage.setItem("user",JSON.stringify(e))},V=function(){M.info("clearUser called"),localStorage.removeItem("user")},z=function(){M.info("getUser called");var e=localStorage.getItem("user");return e?(M.info("user found",{currentlyStoredUser:e}),JSON.parse(e)):(M.info("no user found"),null)},H=w("user.subscriptions"),X=n(52);!function(e){e.NOT_RELEVANT="0_NOT_RELEVANT",e.TOPIC_RELEVANT_DOES_NOT_ANSWER="1_TOPIC_RELEVANT_DOES_NOT_ANSWER",e.GOOD_ANSWER="2_GOOD_ANSWER",e.PERFECT_ANSWER="3_PERFECT_ANSWER",e.MISLEADING_ANSWER="-1_MISLEADING_ANSWER"}(B||(B={}));var Y,Z=[{text:"Misleading Answer",relevanceLevel:B.MISLEADING_ANSWER,annotationRequired:!1,buttonColor:"#FF7E61"},{text:"Not Relevant",relevanceLevel:B.NOT_RELEVANT,annotationRequired:!1,buttonColor:"#EBB25B"},{text:"Topic Relevant, But Does Not Answer",relevanceLevel:B.TOPIC_RELEVANT_DOES_NOT_ANSWER,annotationRequired:!0,buttonColor:"#FFF498"},{text:"Good Answer",relevanceLevel:B.GOOD_ANSWER,annotationRequired:!0,buttonColor:"#A1E880"},{text:"Perfect Answer",relevanceLevel:B.PERFECT_ANSWER,annotationRequired:!0,buttonColor:"#73FFC3"}];!function(e){e.TO_JUDGE="TO_JUDGE",e.SEND_PENDING="SEND_PENDING",e.SEND_SUCCESS="SEND_SUCCESS",e.SEND_FAILED="SEND_FAILED"}(Y||(Y={}));var $=Object(q.b)("JUDGEMENTS_PRELOADED"),K=Object(q.b)("JUDGEMENT_PAIR_RATED"),Q=Object(q.b)("RANGE_STARTOREND_SELECTED"),ee=Object(q.b)("RANGE_DELETED"),te=Object(q.b)("JUDGEMENT_STATUS_SET"),ne=Object(q.b)("JUDGEMENT_PAIR_SELECTED"),ae=Object(q.c)({judgementPairs:[]},(function(e){return e.addCase($,(function(e,t){e.alreadyFinished=t.payload.alreadyFinished,e.remainingToFinish=t.payload.remainingToFinish;var n=t.payload.judgements;e.judgementPairs=n.map((function(t){var n,a,r=e.judgementPairs.find((function(e){return e.id===t.id}));return r&&(a=t,(n=r).queryText===a.queryText&&n.docAnnotationParts.length===a.docAnnotationParts.length&&!n.docAnnotationParts.some((function(e,t){return a.docAnnotationParts[t]!==e})))?Object(X.a)({},t,{},r):Object(X.a)({},t,{annotatedRanges:[],status:Y.TO_JUDGE})}))})).addCase(K,(function(e,t){var n=e.judgementPairs.find((function(t){return t.id===e.currentJudgementPairId}));n.relevanceLevel=t.payload.relevanceLevel,Z.find((function(e){return e.relevanceLevel===n.relevanceLevel})).annotationRequired||(n.annotatedRanges=[])})).addCase(Q,(function(e,t){var n=e.judgementPairs.find((function(t){return t.id===e.currentJudgementPairId}));if(void 0===n.currentAnnotationStart)n.currentAnnotationStart=t.payload.annotationPartIndex;else{var a=n.currentAnnotationStart,r=t.payload.annotationPartIndex,o=a<r?a:r,i=r>a?r:a;n.annotatedRanges.push({start:o,end:i}),n.currentAnnotationStart=void 0}})).addCase(ee,(function(e,t){var n=e.judgementPairs.find((function(t){return t.id===e.currentJudgementPairId}));n.annotatedRanges=n.annotatedRanges.filter((function(e){return!(t.payload.annotationPartIndex>=e.start&&t.payload.annotationPartIndex<=e.end)}))})).addCase(te,(function(e,t){e.judgementPairs.find((function(e){return e.id===t.payload.id})).status=t.payload.status})).addCase(ne,(function(e,t){var n,a;e.currentJudgementPairId!==(null===(n=t.payload)||void 0===n?void 0:n.id)&&(e.currentJudgementPairId=null===(a=t.payload)||void 0===a?void 0:a.id,e.currentJudgementPairSelectedOnMs=(new Date).getTime())}))}));var re,oe={preloadJudgements:$,rateJudgementPair:K,selectRangeStartEnd:Q,deleteRange:ee,setJudgementStatus:te,selectJudgementPair:ne},ie=ae,ce=w("judgements.service"),ue=function(){var e;return m.a.async((function(t){for(;;)switch(t.prev=t.next){case 0:return ce.info("executing preload judgements..."),t.next=3,m.a.awrap(k(Ne.getState().user.accessToken.val));case 3:return e=t.sent,Ne.dispatch(oe.preloadJudgements(e)),ce.info("preload judgements succeeded!",{response:e}),t.abrupt("return",e);case 7:case"end":return t.stop()}}))},se=function(){var e,t,n,a,r,o,i,c,u,s,l,d;return m.a.async((function(f){for(;;)switch(f.prev=f.next){case 0:for(ce.info("executing submit current judgement..."),e=Ne.getState().annotation,t=e.judgementPairs.find((function(t){return t.id===e.currentJudgementPairId})),n=[],a=!0,r=!1,o=void 0,f.prev=7,i=t.annotatedRanges[Symbol.iterator]();!(a=(c=i.next()).done);a=!0)for(u=c.value,s=u.start;s<=u.end;s++)n.push(s);f.next=15;break;case 11:f.prev=11,f.t0=f.catch(7),r=!0,o=f.t0;case 15:f.prev=15,f.prev=16,a||null==i.return||i.return();case 18:if(f.prev=18,!r){f.next=21;break}throw o;case 21:return f.finish(18);case 22:return f.finish(15);case 23:return l=(new Date).getTime(),d=l-e.currentJudgementPairSelectedOnMs,Ne.dispatch(oe.setJudgementStatus({id:t.id,status:Y.SEND_PENDING})),f.prev=26,f.next=29,m.a.awrap(C(Ne.getState().user.accessToken.val,t.id,{relevanceLevel:t.relevanceLevel,relevancePositions:n,durationUsedToJudgeMs:d}));case 29:f.next=36;break;case 31:throw f.prev=31,f.t1=f.catch(26),ce.error("submit current judgement failed!",{id:t.id,error:f.t1}),Ne.dispatch(oe.setJudgementStatus({id:t.id,status:Y.SEND_FAILED})),f.t1;case 36:Ne.dispatch(oe.setJudgementStatus({id:t.id,status:Y.SEND_SUCCESS})),ce.info("submit current judgement succeeded!");case 38:case"end":return f.stop()}}),null,null,[[7,11,15,23],[16,,18,22],[26,31]])},le=n(93);!function(e){e.ANNOTATOR="ANNOTATOR",e.ADMIN="ADMIN"}(re||(re={}));var de=Object(q.b)("AUTHENTICATED"),fe=Object(q.b)("LOGGED_OUT"),me=Object(q.c)(null,(function(e){return e.addCase(de,(function(e,t){var n,a,r,o=le.decode(t.payload.accessToken),i=le.decode(t.payload.refreshToken),c=!!(null===(n=o.resource_access)||void 0===n?void 0:null===(a=n["realm-management"])||void 0===a?void 0:null===(r=a.roles)||void 0===r?void 0:r.some((function(e){return"manage-users"===e})));return Object(X.a)({},e,{accessToken:{val:t.payload.accessToken,expiry:o.exp},refreshToken:{val:t.payload.refreshToken,expiry:i.exp},role:c?re.ADMIN:re.ANNOTATOR})})).addCase(fe,(function(){return null}))})),pe={authenticate:de,logout:fe},ge=me,ve=w("annotation.subscriptions");function Ee(e,t){var n=t.memoizeOnValue(e);e.subscribe((function(){var a=t.memoizeOnValue(e);n!==a&&(n=a,t.listener(e))}))}var be=w("store-logger-middleware"),he=function(e){return function(t){return function(n){be.group(n.type),be.info("dispatching",n);var a=t(n);return be.info("next state",e.getState()),be.groupEnd(),a}}},_e=Object(G.combineReducers)({user:ge,annotation:ie}),Ne=Object(q.a)({reducer:_e,middleware:[he].concat(Object(U.a)(Object(q.d)()))});[function(e){var t,n=_.a.duration(1,"minutes"),a=e.getState().user;e.subscribe((function(){var r=e.getState().user;if(r!==a){if(H.info("user changed",{previousUser:a,userOfStore:r}),!(a=r))return H.info("no user present, clear scheduled refresh and browser storage"),clearTimeout(t),V();W({accessToken:a.accessToken.val,refreshToken:a.refreshToken.val}),H.info("user saved to browser storage");var o=_.a.unix(a.accessToken.expiry).subtract(n),i=_.a.duration(o.diff(_()())).asMilliseconds(),c=a.refreshToken.val;t=setTimeout((function(){return m.a.async((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,m.a.awrap(Oe.refresh(c));case 2:case"end":return e.stop()}}))}),i),H.info("refresh got scheduled, scheduled at: ".concat(o.toString()))}}))},function(e){e.subscribe((function(){var t=e.getState().annotation,n=e.getState().user;n&&n.accessToken?n.role===re.ANNOTATOR?void 0===t.remainingToFinish&&(ve.info("no judgement pairs got loaded from the server yet --\x3e execute preload..."),ue()):ve.info("no judgement pairs got loaded from the server yet, but user role is not annotator --\x3e skip preload"):ve.info("no judgement pairs got loaded from the server yet, but there is no access token available --\x3e skip preload")})),Ee(e,{memoizeOnValue:function(e){return e.getState().annotation.judgementPairs},listener:function(e){var t=e.getState().annotation;void 0!==t.remainingToFinish&&t.judgementPairs.filter((function(e){return e.status===Y.TO_JUDGE||e.status===Y.SEND_PENDING})).length<=1&&t.remainingToFinish>t.judgementPairs.length&&(ve.info("count of preloaded judgement pairs does not fulfill threshold and there are remaining judgements to preload on the server --\x3e execute preload..."),ue())}}),Ee(e,{memoizeOnValue:function(e){return e.getState().annotation.judgementPairs},listener:function(e){var t=e.getState().annotation.judgementPairs.find((function(e){return e.status===Y.TO_JUDGE}));e.dispatch(oe.selectJudgementPair(t))}})}].forEach((function(e){return e(Ne)}));var xe=w("auth.service"),Oe={login:function(e,t){var n;return m.a.async((function(a){for(;;)switch(a.prev=a.next){case 0:return xe.info("executing login...",{username:e}),a.next=3,m.a.awrap(D({username:e,password:t}));case 3:n=a.sent,xe.info("login succeeded!",{loginResponse:n}),Ne.dispatch(pe.authenticate(n));case 6:case"end":return a.stop()}}))},refresh:function(e){var t;return m.a.async((function(n){for(;;)switch(n.prev=n.next){case 0:return xe.info("executing refresh...",{refreshToken:e}),n.prev=1,n.next=4,m.a.awrap(P({refreshToken:e}));case 4:t=n.sent,n.next=12;break;case 7:return n.prev=7,n.t0=n.catch(1),xe.error("refresh failed!",n.t0),Ne.dispatch(pe.logout()),n.abrupt("return");case 12:xe.info("refresh succeeded!",{refreshResponse:t}),Ne.dispatch(pe.authenticate(t));case 14:case"end":return n.stop()}}),null,null,[[1,7]])},accessTokenExpired:function(){var e=Ne.getState().user;return!e||_.a.unix(e.accessToken.expiry).isBefore(_.a.now())}},Te=n(40),Se=n.n(Te),je=function(e){var t=e.children,n=Object(g.a)(e,["children"]);return r.a.createElement("div",Object.assign({},n,{className:"".concat(n.className," ").concat(Se.a.floatingLabelInput)}),t)},Ae=function(e){var t=e.children,n=Object(g.a)(e,["children"]);return r.a.createElement("div",Object.assign({},n,{className:"".concat(n.className," ").concat(Se.a.floatingLabelInputContainer)}),t)},Re=function(e){var t=e.active,n=e.children,a=Object(g.a)(e,["active","children"]);return r.a.createElement("label",Object.assign({},a,{className:"".concat(a.className," ").concat(!!t&&Se.a.floatingLabelActive," ").concat(Se.a.floatingLabel)}),n)},ye=function(e){var t=e.children,n=e.active,a=e.inputRef,o=Object(g.a)(e,["children","active","inputRef"]);return r.a.createElement("input",Object.assign({},o,{ref:a,onBlur:o.onBlur,className:"".concat(o.className," ").concat(!!n&&Se.a.floatingInputActive," ").concat(Se.a.floatingInput)}),t)},we=function(e){var t=e.id,n=e.label,o=e.type,i=e.className,c=e.value,u=Object(g.a)(e,["id","label","type","className","value"]),s=Object(a.useState)(!!c&&c.length>0),l=Object(p.a)(s,2),d=l[0],f=l[1],m=Object(a.useRef)(null);return r.a.createElement(je,null,r.a.createElement(Ae,{onClick:function(){m.current.focus()},className:i},r.a.createElement(Re,{htmlFor:t,active:d},n),r.a.createElement(ye,Object.assign({},u,{active:d,id:t,onBlur:function(e){e.target.value&&0!==e.target.value.length||f(!1),u.onBlur&&u.onBlur(e)},onFocus:function(e){f(!0),u.onFocus&&u.onFocus(e)},inputRef:m,type:o}))))},Ie=n(165),Le=n.n(Ie),De=function(){return r.a.createElement("div",{className:Le.a.ldsEllipsis},r.a.createElement("div",null),r.a.createElement("div",null),r.a.createElement("div",null),r.a.createElement("div",null))},Pe=n(53),ke=n.n(Pe),Ce=function(e){var t=e.componentRef,n=e.children,o=e.buttonStyle,i=void 0===o?"normal":o,c=Object(g.a)(e,["componentRef","children","buttonStyle"]),u=Object(a.useState)(!1),s=Object(p.a)(u,2),l=s[0],d=s[1];return r.a.createElement("button",Object.assign({},c,{onClick:function(e){"function"===typeof c.onClick&&c.onClick(e),d(!0)},onTransitionEnd:function(e){"function"===typeof c.onTransitionEnd&&c.onTransitionEnd(e),d(!1)},ref:t,className:"".concat(c.className," ").concat(ke.a.button," ").concat(l&&ke.a.animate," ").concat("normal"===i?ke.a.styleNormal:ke.a.styleBold)}),n)},Fe=function(e){var t=e.label,n=Object(g.a)(e,["label"]),a=Object(v.c)(n),o=Object(p.a)(a,2),i=o[0],c=o[1],u=c.touched&&c.error;return r.a.createElement("div",null,r.a.createElement(we,Object.assign({className:"".concat(b.a.inputField," ").concat(u&&b.a.inputFieldError),htmlFor:n.id||n.name,label:t},i,n)))},Je=function(){return!!Object(c.c)((function(e){return e.user}))?r.a.createElement(s.a,{to:"/"}):r.a.createElement("div",{className:b.a.container},r.a.createElement("div",{className:b.a.inputArea},r.a.createElement("span",null,"Login"),r.a.createElement(v.b,{initialValues:{username:"",password:"",loginError:""},validate:function(e){var t={};return e.username||(t.username="Required"),e.password||(t.password="Required"),t},onSubmit:function(e,t){var n,a;return m.a.async((function(r){for(;;)switch(r.prev=r.next){case 0:return n=t.setSubmitting,a=t.setErrors,r.prev=1,r.next=4,m.a.awrap(Oe.login(e.username,e.password));case 4:r.next=10;break;case 6:r.prev=6,r.t0=r.catch(1),"function"===typeof r.t0.getStatus&&401===r.t0.getStatus()?a({loginError:"Credentials invalid."}):"string"===typeof r.t0.message&&/Network Error/i.test(r.t0.message)||"ECONNABORTED"===r.t0.code?a({loginError:"Network error. Please make sure to be online."}):a({loginError:"Unexpected error occured during login."}),n(!1);case 10:case"end":return r.stop()}}),null,null,[[1,6]])}},(function(e){var t=e.isSubmitting,n=e.errors;return r.a.createElement(v.a,null,r.a.createElement(Fe,{type:"text",label:"Username",name:"username"}),r.a.createElement(Fe,{type:"text",label:"Password",name:"password"}),n.loginError&&n.loginError.length>0&&r.a.createElement("ul",{className:b.a.errorList},r.a.createElement("li",null,r.a.createElement("span",null,n.loginError))),r.a.createElement(Ce,{buttonStyle:"bold",type:"submit",disabled:t},t?r.a.createElement(De,null):"Submit"))}))))},Be=w("admin.service"),Ue={exportJudgements:function(){var e;return m.a.async((function(t){for(;;)switch(t.prev=t.next){case 0:return Be.info("executing export of judgements..."),t.next=3,m.a.awrap(F(Ne.getState().user.accessToken.val));case 3:Ge("judgements.tsv",e=t.sent),Be.info("export of judgements succeeded!",{response:e});case 6:case"end":return t.stop()}}))}};function Ge(e,t){var n=new Blob([t],{type:"text/tsv"}),a=window.document.createElement("a");a.href=window.URL.createObjectURL(n),a.download=e,document.body.appendChild(a),a.click(),document.body.removeChild(a)}var qe=function(){return r.a.createElement("div",null,r.a.createElement("button",{onClick:Ue.exportJudgements},"Export Judgements"))},Me=n(37),We=n(69),Ve=n(318),ze=n(319),He=n(22),Xe=n.n(He),Ye=function(){},Ze=function(){var e,t=Object(c.c)((function(e){return e.annotation})),n=Object(c.b)(),o=Object(a.useState)(void 0),i=Object(p.a)(o,2),u=i[0],s=i[1],l=Object(a.useRef)(null),d=Object(a.useRef)(null),f=Object(a.useRef)(null),m=Object(a.useRef)(null),g=Object(a.useRef)(null),v={Digit1:l,Digit2:d,Digit3:f,Digit4:m,Digit5:g},E=(e={},Object(Me.a)(e,B.MISLEADING_ANSWER,l),Object(Me.a)(e,B.NOT_RELEVANT,d),Object(Me.a)(e,B.TOPIC_RELEVANT_DOES_NOT_ANSWER,f),Object(Me.a)(e,B.GOOD_ANSWER,m),Object(Me.a)(e,B.PERFECT_ANSWER,g),e);Object(a.useLayoutEffect)((function(){var e=function(e){var t=e.code;"Digit1"!==t&&"Digit2"!==t&&"Digit3"!==t&&"Digit4"!==t&&"Digit5"!==t||v[t].current.click()};return document.addEventListener("keyup",e,{passive:!0}),function(){return document.removeEventListener("keyup",e)}}));var b=t.judgementPairs.filter((function(e){return e.status===Y.SEND_SUCCESS})),h=void 0===t.remainingToFinish?void 0:t.remainingToFinish-b.length,_=void 0===t.alreadyFinished?void 0:t.alreadyFinished+b.length;if(void 0!==h&&h<=0)return r.a.createElement("div",null,"Finished!");var N=t.judgementPairs.find((function(e){return e.id===t.currentJudgementPairId}));if(!N)return r.a.createElement("div",null,"Loading...");var x,O=function(e){return function(){return s(e)}},T=Z.find((function(e){return e.relevanceLevel===N.relevanceLevel})),S=null===T||void 0===T?void 0:T.annotationRequired,j=!T||T.annotationRequired&&(0===N.annotatedRanges.length||void 0!==N.currentAnnotationStart);void 0!==h&&void 0!==_&&(x=Math.max(document.documentElement.clientWidth,window.innerWidth||0)*(_/(h+_)));return r.a.createElement(r.a.Fragment,null,void 0!==x&&r.a.createElement("div",{style:{width:x},className:Xe.a.progressBar}),r.a.createElement("div",{className:Xe.a.container,onClickCapture:function(){return s(void 0)}},r.a.createElement("div",{className:Xe.a.queryText},N.queryText),r.a.createElement("div",{key:N.id,className:Xe.a.annotationArea},N.docAnnotationParts.map((function(e,t){var a=e.replace(" ","\xa0"),o=N.currentAnnotationStart===t?Xe.a.rangeStart:"",i=N.annotatedRanges.some((function(e){return e.start<=t&&e.end>=t})),c=S&&!i,l=S?Xe.a.gridStyle:"",d=function(e){return r.a.createElement("span",{ref:e,key:t,onClick:c?(u=t,function(){n(oe.selectRangeStartEnd({annotationPartIndex:u}))}):i?O(t):Ye,className:"".concat(Xe.a.annotatePart," ").concat(o," ").concat(i?Xe.a.isInRange:""," ").concat(l)},a);var u};return u!==t?d():r.a.createElement(We.c,null,r.a.createElement(Ve.a,null,(function(e){var t=e.ref;return d(t)})),r.a.createElement(ze.a,{placement:"top"},(function(e){var a=e.ref,o=e.style,i=e.placement;return r.a.createElement("div",{ref:a,style:o,"data-placement":i},r.a.createElement(Ce,{className:Xe.a.annotatePartTooltipButton,onClick:function(e){n(oe.deleteRange({annotationPartIndex:t})),s(void 0)}},r.a.createElement("svg",{xmlns:"http://www.w3.org/2000/svg",width:"14",height:"18",viewBox:"5 3 14 18",fill:"white"},r.a.createElement("path",{d:"M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"})),"Remove"))})))}))),r.a.createElement("div",{className:Xe.a.buttonContainer},Z.map((function(e){return r.a.createElement("div",{key:e.relevanceLevel},r.a.createElement(Ce,{style:{background:e.buttonColor},className:Xe.a.rateButton,onClick:(t=e.relevanceLevel,function(){n(oe.rateJudgementPair({relevanceLevel:t}))}),componentRef:E[e.relevanceLevel]},e.text));var t}))),r.a.createElement("div",null,r.a.createElement(Ce,{buttonStyle:"bold",disabled:j,onClick:function(){se()}},"Next"))))},$e=function(e){var t=e.requiredRole,n=Object(g.a)(e,["requiredRole"]),a=Object(c.c)((function(e){return e.user}));return a&&(null===a||void 0===a?void 0:a.role)===t?r.a.createElement(s.b,n):r.a.createElement(s.a,{to:"/login"})};var Ke=function(){var e=Object(c.c)((function(e){return e.user}));return e?e.role===re.ADMIN?r.a.createElement(s.a,{to:"/admin"}):e.role===re.ANNOTATOR?r.a.createElement(s.a,{to:"/annotator"}):void function(e){throw new Error("Should not get here")}(e.role):r.a.createElement(s.a,{to:"/login"})},Qe=function(){return r.a.createElement("div",{className:d.a.app},r.a.createElement(u.a,null,r.a.createElement(s.d,null,r.a.createElement(s.b,{exact:!0,path:"/"},r.a.createElement(Ke,null)),r.a.createElement(s.b,{path:"/login"},r.a.createElement(Je,null)),r.a.createElement($e,{path:"/admin",requiredRole:re.ADMIN},r.a.createElement(qe,null)),r.a.createElement($e,{path:"/annotator",requiredRole:re.ANNOTATOR},r.a.createElement(Ze,null)))))};Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));var et=w("load-stored-user");var tt=[function(){et.info("load user from browser storage");var e=z();e?(et.info("stored user found. dispatching authenticate...",{storedUser:e}),Ne.dispatch(pe.authenticate(e))):et.info("no stored user found")}];w("boot").info("executing boot scripts..."),tt.forEach((function(e){return e()})),i.a.render(r.a.createElement(c.a,{store:Ne},r.a.createElement(Qe,null)),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then((function(e){e.unregister()}))},40:function(e,t,n){e.exports={floatingLabelInput:"FloatingTextInput_floatingLabelInput__1efr1",floatingLabelInputContainer:"FloatingTextInput_floatingLabelInputContainer__2LY7N",floatingLabel:"FloatingTextInput_floatingLabel__p_hYS",floatingLabelActive:"FloatingTextInput_floatingLabelActive__3cGGa",floatingInput:"FloatingTextInput_floatingInput__k7JFP",floatingInputActive:"FloatingTextInput_floatingInputActive__1t44z"}},45:function(e,t,n){e.exports={container:"Login_container__-Ut2j",inputArea:"Login_inputArea__2HA21",errorList:"Login_errorList__1e1pq",inputField:"Login_inputField__2z-fg",inputFieldError:"Login_inputFieldError__-xPtR"}},53:function(e,t,n){e.exports={button:"Button_button__aUVEj",styleBold:"Button_styleBold__OSRgP",styleNormal:"Button_styleNormal__21gUz",animate:"Button_animate__P4pSL"}}},[[171,1,2]]]);
//# sourceMappingURL=main.15b6a7eb.chunk.js.map