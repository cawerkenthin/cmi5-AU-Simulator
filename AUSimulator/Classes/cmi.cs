namespace AUSimulator.Classes
{
    public struct cmi5Verb
    {
        public const string Launched = "http://adlnet.gov/expapi/verbs/launched";
        public const string Initialized = "http://adlnet.gov/expapi/verbs/initialized";
        public const string Completed = "http://adlnet.gov/expapi/verbs/completed";
        public const string Passed = "http://adlnet.gov/expapi/verbs/passed";
        public const string Failed = "http://adlnet.gov/expapi/verbs/failed";
        public const string Abandoned = "https://w3id.org/xapi/adl/verbs/abandoned";
        public const string Waived = "https://w3id.org/xapi/adl/verbs/waived";
        public const string Terminated = "http://adlnet.gov/expapi/verbs/terminated";
        public const string Satisfied = "https://w3id.org/xapi/adl/verbs/satisfied";
    }

    public struct cmi5Constants
    {
        public const string SessionIdIRI = "https://w3id.org/xapi/cmi5/context/extensions/sessionid";
        public const string PublisherId = "https://w3id.org/xapi/cmi5/context/extensions/publisherid";
        public const string cmi5Category = "https://w3id.org/xapi/cmi5/context/categories/cmi5";
        public const string Progress = "https://w3id.org/xapi/cmi5/result/extensions/progress";
        public const string masteryScore = "https://w3id.org/xapi/cmi5/context/extensions/masteryScore";
        public const string moveOn = "https://w3id.org/xapi/cmi5/context/categories/moveon";
    }
}