setLoading(false);

function onSubmitButtonClick() {
    var phrase = getInputValue('Phrase');
    if(!phrase) {
        return;
    }
    setLoading(true);
    $.get( "/getreport/", { phrases: phrase }, function(data) {
        setLoading(false);
        if(data.success) {
            window.open(data.url, '_blank');
        } else {
            document.getElementById('Result').innerHTML = 'error';
        }
    });
}

function getInputValue(id) {
    return document.getElementById(id).value;
}

function setLoading(isLoading) {
    $('#SubmitButton')[isLoading ? 'hide' : 'show']();
    $('#LoadingPanel')[isLoading ? 'show' : 'hide']();
}