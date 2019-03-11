function GoLMS() {  
    if ((typeof returnUrl) == "string" && returnUrl.length > 0) {
       var href = decodeURIComponent(returnUrl);
       document.location.href = href;
        return false;
    }
    self.close();           // Not allowed in FireFox
    return false;
}

function SendStatement(verbName, score, duration, progress) {
    // What verb is to be sent?
    var verb;
    switch (verbName) {
        case "Initialized":
            verb = ADL.verbs.initialized;
            break;
        case "Completed":
            verb = ADL.verbs.completed;
            break;
        case "Passed":
            verb = ADL.verbs.passed;
            break;
        case "Failed":
            verb = ADL.verbs.failed;
            break;
        case "Terminated":
            verb = ADL.verbs.terminated;
            break;
    }

    if (verb) {

        // Context extensions were read from the State document's context template
        var cExtentions = cmi5Controller.getContextExtensions();

        var success;

        var verbUpper = verbName.toUpperCase();
        if (verbUpper === "PASSED" || verbUpper === "FAILED") {
            // Passed and Failed statements require the masteryScore as an context extension
            if (cmi5Controller.masteryScore) {
                cExtentions["https://w3id.org/xapi/cmi5/context/extensions/masteryScore"] = cmi5Controller.masteryScore;
            }

            // Per section 9.5.2 of the cmi5 spec
            success = verbUpper === "PASSED";
        }

        // Automatically set complete based on cmi5 rules (9.5.3)
        var complete = verbUpper === "COMPLETED";

        // Get basic cmi5 defined statement object
        var stmt = cmi5Controller.getcmi5DefinedStatement(verb,
                                                          cExtentions);

        // Add UTC timestamp.  This is required by cmi5 spec.
        stmt.timestamp = (new Date()).toISOString();

        // Do we need a result object?
        if (success || complete || score || duration || progress) {
            stmt.result = {};

            if (typeof(complete) === "boolean") {
                stmt.result.completion = complete;
            }

            if (typeof(success) === "boolean") {
                stmt.result.success = success;
            }

            if (typeof(score) === "number") {
                stmt.result.score = { "scaled": parseFloat(score) };
            }

            if (typeof(progress) === "number") {
                stmt.result.extensions = { "https://w3id.org/xapi/cmi5/result/extensions/progress": parseInt(progress) };
            }

            if (duration) {
                stmt.result.duration = duration;
            }

            // Statements that include success or complete must include a moveon activity in the context
            if (success || complete) {
                stmt.context.contextActivities.category.push(
                {
                    "id": "https://w3id.org/xapi/cmi5/context/categories/moveon"
                });
            }
        }

        cmi5Controller.sendStatement(stmt, sentStatement);

    } else {
        console.log("Invalid verb passed: " + verbName);
    }

    return false;
}

function sentStatement(resp, obj) {
    // This is the callback method referenced in call to cmi5Controller.sendStatement()
    if (resp && resp.status == 200) {
        // statement was sent
        console.log("Statement sent");
    }
}

function parse(val) {
    // Utility function to parse command line parameters
    var result = "Not found",
        tmp = [];
    val = val.toUpperCase();
    location.search
        .substr(1)
        .split("&")
        .forEach(function (item) {
            tmp = item.split("=");
            if (tmp[0].toUpperCase() === val) result = decodeURIComponent(tmp[1]);
        });
    return result;
}
