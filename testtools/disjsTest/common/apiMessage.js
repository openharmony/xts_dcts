var logTag = 'RpcServer'
export default class apiMessage {
    _deviceName = null;
    _className = null;
    _methodName = null;
    _api_session = null;
    _parameterTypes = null;
    _parameters = null;
    _apiResult = null;

    constructor(deviceName, className, methodName, api_session, parameterTypes, parameters, apiResult) {
        this._deviceName = deviceName;
        this._className = className;
        this._methodName = methodName;
        this._api_session = api_session;
        this._parameterTypes = parameterTypes;
        this._parameters = parameters;
        this._apiResult = apiResult;

    }
    marshalling(messageParcel) {
        console.log(logTag + "into marshalling.");
        messageParcel.writeString(this._deviceName);
        messageParcel.writeString(this._className);
        messageParcel.writeString(this._methodName);
        messageParcel.writeString(this._api_session);
        console.log(logTag + "writeString successfully.");
        messageParcel.writeStringArray(this._parameterTypes);
        messageParcel.writeStringArray(this._parameters);
        messageParcel.writeString(this._apiResult)
        console.log(logTag + "marshalling successfully.");
        return true;
    }

    unmarshalling(messageParcel) {
        console.log(logTag + "into unmarshalling.");
        this._deviceName = messageParcel.readString();
        this._className = messageParcel.readString();
        this._methodName = messageParcel.readString();
        this._api_session = messageParcel.readString();
        this._parameterTypes = messageParcel.readStringArray();
        this._parameters = messageParcel.readStringArray();
        this._apiResult = messageParcel.readString();
        console.log(logTag + "unmarshalling successfully.");
        return true;
    }
}