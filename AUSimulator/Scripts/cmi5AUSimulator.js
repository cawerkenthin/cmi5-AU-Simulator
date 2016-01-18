$(function () {
    endPoint = parse("endpoint");
    fetchUrl = parse("fetch");
    registration = parse("registration");
    activityId = parse("activityid");
    actor = parse("actor");

    jq = $;

    jq("input:radio[name='rdoVerb']").change(function () {
        // Default success and completion based on judgement verbs
        var verb = jq(this).val();
        if (verb == "Initialized") {
            jq("input:radio[name='rdoComplete'][value='']").prop("checked", true);
            jq("input:radio[name='rdoSuccess'][value='']").prop("checked", true);
        }
        if (verb == "Completed") {
            jq("input:radio[name='rdoComplete'][value='true']").prop("checked", true);
            jq("input:radio[name='rdoSuccess'][value='']").prop("checked", true);
        }
        if (verb == "Passed") {
            jq("input:radio[name='rdoComplete'][value='']").prop("checked", true);
            jq("input:radio[name='rdoSuccess'][value='true']").prop("checked", true);
        }
        if (verb == "Failed") {
            jq("input:radio[name='rdoSuccess'][value='false']").prop("checked", true);
            jq("input:radio[name='rdoComplete'][value='false']").prop("checked", true);
        }
        if (verb == "Terminated") {
            jq("#durationMinutes").val("1");
        }
    });
});

function GetAgentProfile() {
    var conf = {
        "endpoint": endPoint,
        "auth": "Basic " + window.btoa(jq("#txtAuthToken").val() + ":CMI5")
    }
    ADL.XAPIWrapper.changeConfig(conf);

    var r = ADL.XAPIWrapper.getAgentProfile(jq.parseJSON(actor), "cmi5LearnerPreferences", null);

    jq("#txtProfile").val(JSON.stringify(r));

    MarkSuccess("btnProfile");
    MarkNext("btnStatement");

    return false;
}

function GetAuthToken() {
    jq.support.cors = true;
    jq.ajax({
        async: false,
        url: fetchUrl,
        type: "POST",
        dataType: "json",
        contentType: "application/json; charset=utf-8"
    }).done(function (data) {
        // Check for error
        var e = typeof (data["error-code"]);
        if (e == "string") {
            alert("error-code " + data["error-code"] + ": " + data["error-text"]);
            return;
        }
        e = typeof (data["auth-token"]);
        if (e == "string") {
            jq("#txtAuthToken").val(data["auth-token"]);
            MarkSuccess("btnAuthToken");
            MarkNext("btnState");
        } else {
            alert("Invalid structure returned: " + data.toString());
        }
    }).fail(function (jqXHR, textStatus, errorThrown) {
        alert(errorThrown);
    });
    return false;
} 

function GetStateApi() {
    jq.support.cors = true;
    jq.ajax({
        async: true,
        url: "Handlers/Getcmi5StateDocument.ashx?endpoint=" + endPoint +
             "&activityId=" + activityId +
             "&actor=" + actor +
             "&registration=" + registration +
             "&token=" + jq("#txtAuthToken").val(),
        type: "POST",
        dataType: "json",
        contentType: "application/json; charset=utf-8"
    }).done(function (data) {
        // Check for error
        if (data["ErrorCode"] != "0") {
            alert("error-code " + data["ErrorCode"] + ": " + data["ErrorText"]);
            return false;
        }

        // Set the sessionId var
        var obj = JSON.parse(data["StateDocument"]);
        sessionId = obj.contextTemplate.extensions["http://purl.org/xapi/cmi5/context/extensions/sessionid"];

        // Get returnUrl
        var r = typeof (obj["returnURL"]);
        if (r == "string") {
            returnUrl = obj["returnURL"];
        }

        // Display mastery score
        masteryScore = obj["masteryScore"];
        jq("#spnMasteryScore").html("Mastery = " + masteryScore.toString());

        // Display the state document
        jq("#txtState").val(JSON.stringify(obj, null, 4));

        MarkSuccess("btnState");
        MarkNext("btnProfile");

    }).fail(function (jqXHR, textStatus, errorThrown) {
        alert(errorThrown);
    });
    return false;
}

function GoLMS() {
    if ((typeof returnUrl) == "string" && returnUrl.length > 0) {
        document.location.href = returnUrl;
        return false;
    }
    self.close();           // Not allowed in FireFox
    return false;
}

function MarkNext(buttonId) {
    jq("#" + buttonId).removeClass("btn-success btn-default").addClass("btn-primary");
}

function MarkSuccess(buttonId) {
    jq("#" + buttonId).removeClass("btn-primary btn-default").addClass("btn-success");
}

function SendStatement() {
    var verb = jq("input:radio[name='rdoVerb']:checked").val();
    var score = jq("#txtScore").val();
    var success = jq("input:radio[name='rdoSuccess']:checked").val();
    var complete = jq("input:radio[name='rdoComplete']:checked").val();
    var duration = jq("#durationHours").val() + ":" +
                   jq("#durationMinutes").val() + ":" +
                   jq("#durationSeconds").val();
    var progress = jq("#input_progress").val();

    jq.ajax({
        async: true,
        url: "Handlers/Sendcmi5Statement.ashx?endpoint=" + endPoint +
             "&activityId=" + activityId +
             "&actor=" + actor +
             "&registration=" + registration +
             "&token=" + jq("#txtAuthToken").val() +
             "&sessionId=" + sessionId +
             "&score=" + score +
             "&masteryScore=" + masteryScore +
             "&verb=" + verb +
             "&success=" + success +
             "&complete=" + complete +
             "&duration=" + duration +
             "&progress=" + progress,
        type: "POST",
        contentType: "application/json; charset=utf-8",
        dataType: "json"
    }).done(function (data) {
        if (data.HasError == 1) {
            alert(data.ErrorMessage);
            return;
        }

        if (verb == "Terminated") {
            MarkSuccess("btnStatement");
            MarkNext("btnLMS");
        }

        jq("#spnVerbsSent").append(verb + "<br/>");
    }).fail(function (jqXHR, textStatus, errorThrown) {
        alert(errorThrown);
    });
    return false;
}

function parse(val) {
    // Parse parameters
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
