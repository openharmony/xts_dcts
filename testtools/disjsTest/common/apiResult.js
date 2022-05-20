
export default class apiResult {
    _resultCode = 0;
    _result = null;

    constructor(resultCode, result) {
        this._resultCode = resultCode;
        this._result = result;
    }
}