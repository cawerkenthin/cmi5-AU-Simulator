var cmi5Controller = (function () {

    // **********************
    // Private variables
    // **********************
    var jq = $;         // Local copy of jquery ($)
    var stmt_;
    var Agent_;

    // **********************
    // Public functions
    // **********************
    return {

        // getAuthToken calls the fetch url to get the authorization token
        getAuthToken: function (callBack) {
            jq.support.cors = true;
            jq.ajax({
                async: true,
                url: fetchUrl,
                type: "POST",
                dataType: "json",
                contentType: "application/json; charset=utf-8"
            })
            .done(function (data) {
                // Check for error
                var e = typeof (data["error-code"]);
                if (e == "string") {
                    alert("error-code " + data["error-code"] + ": " + data["error-text"]);
                    callBack("");
                }
                e = typeof (data["auth-token"]);
                if (e == "string") {
                    callBack(data["auth-token"]);

                } else {
                    alert("Invalid structure returned: " + data.toString());
                    callBack("");
                }

            })
            .fail(function (jqXHR, textStatus, errorThrown) {
                alert(errorThrown);
            });
        },
        getAgentProfile: function (endPointConfig, agent, callback) {
            ADL.XAPIWrapper.changeConfig(endPointConfig);

            ADL.XAPIWrapper.getAgentProfile(jq.parseJSON(agent), "cmi5LearnerPreferences", null, callback);
            return false;
        },
        getStateDocument: function (endPointConfig_, activityId_, agent_, registration_, callback_) {
            ADL.XAPIWrapper.changeConfig(endPointConfig_);
            ADL.XAPIWrapper.getState(activityId_, jq.parseJSON(agent_), "LMS.LaunchData", registration_, null, callback_);
        },
        getcmi5DefinedStatement: function (agent_, verb_, object_, registration_, contextActivities_, contextExtensions_) {
            Agent_ = new ADL.XAPIStatement.Agent(agent_);

            stmt_ = new ADL.XAPIStatement(
                Agent_,
                verb_,
                object_
            );

            stmt_.generateId();

            // Add registration
            stmt_.context = {};
            stmt_.context.registration = registration_;

            // Context activities from State API
            stmt_.context.contextActivities = contextActivities_;

            // cmi5 Context activity
            stmt_.context.contextActivities.category = [];
            stmt_.context.contextActivities.category.push(
            {
                "id": "https://w3id.org/xapi/cmi5/context/categories/cmi5"
            });

            // Extensions
            stmt_.context.extensions = contextExtensions_;

            return stmt_;
        },
        sendStatement: function (endPointConfig_, statement_, callback_) {
            ADL.XAPIWrapper.changeConfig(endPointConfig_);
            ADL.XAPIWrapper.sendStatement(statement_, callback_);
        }
    };
})();