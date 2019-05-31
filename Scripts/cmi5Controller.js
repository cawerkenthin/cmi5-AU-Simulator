var cmi5Controller = (function () {

    // **********************
    // Private variables
    // **********************
    var jq = $;         // Local copy of jquery ($)
    var stmt_;
    var Agent_;
    var endPointConfig;
    var contextActivities;
    var contextExtensions;
    var contextTemplate;
    var initializedCallback;
    var startDateTime;

    // **********************
    // Public properties     
    // **********************
    this.endPoint = "";
    this.fetchUrl = "";
    this.registration = "";
    this.activityId = "";
    this.actor = "";
    this.authToken = "";
    this.object = "";
    
    // State parameters 
    this.sessionId = "";
    this.masteryScore = 0;
    this.launchMode = "";
    this.launchMethod = "";
    this.publisherId = "";
    this.moveOn = "";
    this.launchParameters = "";
    this.returnURL = "";
    this.entitlementKey = { "courseStructure": "", "alternate": "" };
    this.languagePreference = "";
    this.audioPreference = "";

    // **********************
    // Private functions
    // **********************
    function GetBasicStatement(verb_, object_) {
        var s = new ADL.XAPIStatement(
            Agent_,
            verb_,
            object_
        );

        s.generateId();
        return s;
    }

    function AuthTokenFetched() {  
        cmi5Controller.getStateDocument(setStateDocument);
    }

    function SetConfig() {  
        // Set LRS endpoint configuration
        endPointConfig = {
            "endpoint": cmi5Controller.endPoint,
            "auth": "Basic " + cmi5Controller.authToken
        };
    }

    function setAgentProfile(r) {                                                              
        // This is the callback method referenced in call to cmi5Controller.getAgentProfile()  
        if (r.response) {
            var obj = JSON.parse(r.response);
            if (obj.languagePreference) {
                cmi5Controller.languagePreference = obj.languagePreference;
            }
            if (obj.audioPreference) {
                cmi5Controller.audioPreference = obj.audioPreference;
            }
        } else {
            console.log("No agent profile found");
        }
        initializedCallback();
    }

    function setStateDocument(r) {
        if (r.response) {

            // This is the callback method referenced in call to cmi5Controller.getStateDocument()
            var obj = JSON.parse(r.response);

            // Get context activities
            contextTemplate = obj.contextTemplate;
            contextActivities = obj.contextTemplate.contextActivities;

            // Get context extensions
            contextExtensions = obj.contextTemplate.extensions;

            // Get returnUrl
            var t = typeof (obj["returnURL"]);
            if (t === "string") {
                cmi5Controller.returnURL = obj["returnURL"];
            }

            // Get other state properties
            cmi5Controller.moveOn = obj["moveOn"];
            cmi5Controller.masteryScore = obj["masteryScore"];
            cmi5Controller.launchMode = obj["launchMode"];
            cmi5Controller.launchMethod = obj["launchMethod"];
            cmi5Controller.sessionId = contextExtensions["https://w3id.org/xapi/cmi5/context/extensions/sessionid"];
            cmi5Controller.publisherId = contextActivities.grouping[0].id;
            cmi5Controller.launchParameters = obj["launchParameters"];
            cmi5Controller.entitlementKey = obj["entitlementKey"];

            cmi5Controller.getAgentProfile(setAgentProfile);
        } else {
            console.log("No state document found");
        }
    }

    // **********************
    // Public functions
    // **********************
    return {
        // cmi5 controller initialization
        startUp: function(callBack, errorCallBack) {
            startDateTime = new Date();
            initializedCallback = callBack;
            cmi5Controller.object = {
                "objectType": "Activity",
                "id": cmi5Controller.activityId
            };
            cmi5Controller.getAuthToken(AuthTokenFetched, errorCallBack);
        },
        getAUActivityId: function() {               
            return cmi5Controller.activityId;
        },
        getReturnUrl: function() {                  
            return cmi5Controller.returnURL;
        },
        getContextActivities: function() {
            return contextActivities; 
        },
        getContextExtensions: function() {
            return contextExtensions;  
        },
        goLMS: function() {
            var returnUrl = cmi5Controller.getReturnUrl();                  
            if ((typeof returnUrl) == "string" && returnUrl.length > 0) {
                var href = decodeURIComponent(returnUrl);
                document.location.href = href;
                return false;
            }
            self.close();           // Not allowed in FireFox
            return false;
        },
        setEndPoint: function(endpoint) {               
            if (endpoint) {
                cmi5Controller.endPoint = endpoint;
                console.log("Endpoint set to " + endpoint);
            } else {
                console.log("Invalid value passed to setEndpoint()");
            }
        },
        setFetchUrl: function(fetchUrl) {
            if (fetchUrl) {
                cmi5Controller.fetchUrl = fetchUrl;
                console.log("fetchUrl set to " + fetchUrl);
            } else {
                console.log("Invalid value passed to setFetchUrl()");
            }
        },
        setObjectProperties: function(language_, type_,  name_, description_ ) {
            cmi5Controller.object.definition = {};
            if (type_) {
                cmi5Controller.object.definition.type = type_;
            }
            if (!language_) language_ = "und";
            if (name_) {
                cmi5Controller.object.definition.name = {};
                cmi5Controller.object.definition.name[language_] = name_;
            }
            if (description_) {
                cmi5Controller.object.definition.description = {};                          
                cmi5Controller.object.definition.description[language_] = description_;
            }
        },
        setRegistration: function(registration) {
            if (registration) {
                cmi5Controller.registration = registration;
                console.log("Registration set to " + registration);
            } else {
                console.log("Invalid value passed to setRegistration()");
            }
        },
        setActivityId: function(activityId) {
            if (activityId) {
                cmi5Controller.activityId = activityId;
                console.log("Activity ID set to " + activityId);
            } else {
                console.log("Invalid value passed to setActivityId()");
            }
        },
        setActor: function(actor) {
            Agent_ = JSON.parse(actor);
            if (actor) {
                if (Agent_.objectType !== "Agent") {                                         
                    console.log("In cmi5, the actor must have an objectType of Agent.");
                    return;
                }
                if (Agent_.account === null) {
                    console.log("In cmi5, the account property of an Agent is required.");
                    return;
                }
                if (!Agent_.account.homePage) {
                    console.log("In cmi5, the homePage property of an account is required.");
                    return;
                }
                if (!Agent_.account.name) {
                    console.log("In cmi5, the name property of an account is required.");
                    return;
                }

                cmi5Controller.actor = actor;
            } else {
                console.log("Invalid value passed to setActor()");
            }
        },                                                                      
        // getAuthToken calls the fetch url to get the authorization token
        getAuthToken: function (successCallback, tokenErrorCallBack) {                    
            jq.support.cors = true;
            jq.ajax({
                async: true,
                url: cmi5Controller.fetchUrl,                               
                type: "POST",
                dataType: "json"
            })
            .done(function (data) {
                // Check for error
                var e = typeof (data["error-code"]);
                if (e === "string") {
                    console.log("error-code " + data["error-code"] + ": " + data["error-text"]);    
                    if (tokenErrorCallBack && typeof tokenErrorCallBack === "function") { 
                        tokenErrorCallBack("");                                           
                    }
                }

                e = typeof (data["auth-token"]);
                if (e === "string") {
                    cmi5Controller.authToken = data["auth-token"];        
                    SetConfig(data["auth-token"]);                        
                    if (successCallback && typeof successCallback === "function") { 
                        successCallback();
                    }
                } else {
                    console.log("Invalid structure returned: " + data.toString());
                    if (tokenErrorCallBack && typeof tokenErrorCallBack === "function") { 
                        tokenErrorCallBack("");
                    }
                }
            })
            .fail(function (jqXHR, textStatus, errorThrown) {
                tokenErrorCallBack(errorThrown);
            });
        },
        getAgentProfile: function (callback) {        
            ADL.XAPIWrapper.changeConfig(endPointConfig);
            ADL.XAPIWrapper.getAgentProfile(Agent_, "cmi5LearnerPreferences", null, callback);
            return false;
        },
        getStateDocument: function (callback) {      
            ADL.XAPIWrapper.changeConfig(endPointConfig);
            ADL.XAPIWrapper.getState(cmi5Controller.activityId, Agent_, "LMS.LaunchData", cmi5Controller.registration, null, callback);
        },
        getcmi5AllowedStatement: function (verb_, object_, contextActivities_, contextExtensions_) {
            stmt_ = GetBasicStatement(verb_, object_);

            // Add registration
            stmt_.context = {};
            stmt_.context.registration = cmi5Controller.registration;

            // If context parms are not passed, use defaults from STATE.                   
            if (!contextActivities_) {
                contextActivities_ = cmi5Controller.getContextActivities();
            }

            if (!contextExtensions_) {                                          
                contextExtensions_ = cmi5Controller.getContextExtensions();
            }

            // Remove cmi5 category from context activities                     
            var z = contextActivities_;
            if (z.hasOwnProperty("category")) {
                // Do not include the cmi5 category for "allowed" statements
                delete z.category;
            }
            stmt_.context.contextActivities = z;

            // Extensions
            stmt_.context.extensions = contextExtensions_;

            return stmt_;
        },
        getcmi5DefinedStatement: function (verb_, contextExtentions_) {
            stmt_ = GetBasicStatement(verb_, cmi5Controller.object);   
            
            // If context extensions not passed, use default.
            if (!contextExtentions_) {                                          
                contextExtentions_ = cmi5Controller.getContextExtensions();
            }
            
            // Add registration
            stmt_.context = {};
            stmt_.context.registration = cmi5Controller.registration;

            // Context activities from State API
            var z = contextActivities;
            stmt_.context.contextActivities = z;

            // cmi5 Context activity
            stmt_.context.contextActivities.category = [];
            stmt_.context.contextActivities.category.push(
            {
                "id": "https://w3id.org/xapi/cmi5/context/categories/cmi5"
            });

            // Extensions
            stmt_.context.extensions = contextExtentions_;

            return stmt_;
        },
        sendAllowedState: function(stateid_, statevalue_, matchHash_, noneMatchHash_, callback_) {         
            ADL.XAPIWrapper.changeConfig(endPointConfig);
            ADL.XAPIWrapper.sendState(cmi5Controller.activityId, stateid_, statevalue_, matchHash_, noneMatchHash_, callback_);
        },
        getAllowedState: function(stateid_, since_, callback_) {                                          
            ADL.XAPIWrapper.changeConfig(endPointConfig);
            ADL.XAPIWrapper.getState(cmi5Controller.activityId, Agent_, stateid_, cmi5Controller.registration, since_, callback_);
        },
        sendStatement: function (statement_, callback_) {
            // NEW
            // If array statementsSent is defined, push statements to the array.
            if (window.statementsSent && typeof(window.statementsSent) === "object" && Array.isArray(window.statementsSent)) {
                window.statementsSent.push(statement_);
            }

            ADL.XAPIWrapper.changeConfig(endPointConfig);
            ADL.XAPIWrapper.sendStatement(statement_, callback_);
        }
    };
})();
