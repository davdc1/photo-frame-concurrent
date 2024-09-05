const fileInput = document.getElementById('file-input')
const submit = document.getElementById('file-submit')
const messageBox = document.getElementById('input-message-box')
const validateButton = document.getElementById('validate-button')


const MAX_FILE_NUMBER = 10


fileInput.onchange = onFileLoad
submit.onclick = upload
validateButton.onclick = validateFiles


validateButton.disabled = true
submit.disabled = true


function onFileLoad (e) {
    console.log('target value?', e.target.value);
    console.log('target files?', e.target.files);

    messageBox.innerHTML = ''
    submit.disabled = true

    if (e.target.files.length > MAX_FILE_NUMBER) {
        e.target.value = ''
        let message = `max number of files (${MAX_FILE_NUMBER}) exceeded`
        console.log(message);
        messageBox.innerText = message
    }

    if (e.target.files.length) validateButton.disabled = false
    else validateButton.disabled = true


}


function validateFiles () {

    let list = []

    let files = [...fileInput.files]
    files.forEach(({ name, size, type }, idx) => {
        list.push({
            idx,
            name,
            size,
            type
        })
    })

    let formData = new FormData()
    formData.append('fileList', list)

    let payload = {
        list
    }

    // fetch(`http://localhost:${window.env.PORT}/photos/validate-files`, {
    fetch(`/photos/validate-files`, {

        method: 'POST',
        body: JSON.stringify(payload),// JSON.stringify(list), // formData,
        headers: {
            'Content-type': 'application/json; charset=UTF-8'
        }
    })
    .then((response) => {
        if (response.status >= 400) {
            throw response
        } else {
            return response.json()
        }
    })
    .then((data) => {
        console.log(typeof data);

        let array = Object.keys(data)

        if (array.length) {
            let displayList = ''

            array.forEach((key) => {
                displayList += `<li>${data[key]}</li>`

                messageBox.innerHTML = 
                    `<p>inavlid</p>
                    ${displayList}`
            })


        } else {
            messageBox.innerHTML = `<p>valid</p>`

            submit.disabled = false
        }
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}


function upload () {

    let files = fileInput.files
    let formData = new FormData()
    
    console.log(files);

    files = [...files]
    files.forEach((file) => {
        formData.append('fileToUpload', file)
    });

    console.log(files);

    // formData.append('fileToUpload', files[0])


    // fetch(`http://localhost:${window.env.PORT}/photos/upload-photo`, {
    fetch(`/photos/upload-photo`, {
        method: 'POST',
        body: formData,
    })
    .then((response) => {
        if (response.ok) {
            console.log('Files uploaded successfully.');
            messageBox.innerHTML = `<p>Files uploaded successfully</p>`
            fileInput.value = ''
        } else {
            console.error('File upload failed.');
            throw response
        }
    })
    .catch((error) => {
        console.error('Error:', error);
    });

}