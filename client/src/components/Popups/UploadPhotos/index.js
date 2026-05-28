import { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../../../Contexts/AuthContext'
import { PopupContext } from '../../../Contexts/PopupContext'
import Spinner from '../../Spinner'
import { photoService } from '../../../services/photoService'
import resizeImage from '../../../utils/resizeImage'
import { extractMeta } from '../../../utils/exif'
import checkmark from '../../../images/svgs/checkmark.svg'
import failed from '../../../images/svgs/fail.svg'
import './upload-popup.scss'

const ACCEPT_FILES = ['.jpg', '.jpeg', '.png', '.heic', '.heif', '.webp']
const UPLOAD_STATUS = { SUCCESS: 'success', FAILED: 'failed', PENDING: 'pending' }

const UploadPopup = () => {

    const [loading, setLoading] = useState(false)
    const [loaded, setLoaded] = useState([])
    const [fileData, setFileData] = useState([])
    const [uploading, setUploading] = useState(false)

    const { userInfo } = useContext(AuthContext)
    const { payload, toggle } = useContext(PopupContext)

    useEffect(() => {
        return () => {
            if (loaded.length) {
                // loaded.forEach(({ file }) => URL.revokeObjectURL(file.preview))
                loaded.forEach(({ thumbnail }) => URL.revokeObjectURL(thumbnail.preview))
            }
        }
    }, [])

    const onFileLoad = ({ target }) => {
        loadFiles(target)
        setLoading(true)
    }

    const loadFiles = async (target) => {

        let dataArray = []
        let files = Array.from(target.files)

        for (const [idx, file] of files.entries()) {

            let thumbnail
            if (isValid(file)) {
                file.isValid = true
                file.tempId = idx
                let [name_user, ext] = file.name.split('.')
                thumbnail = await resizeImage(file)
                let meta = await extractMeta(file)
                dataArray.push({ name_user, ext, tempId: idx, meta })

            } else {
                file.isValid = false
            }

            try {
                thumbnail.preview = URL.createObjectURL(thumbnail)
            } catch (error) {
                console.log(error);
            }

            setLoaded((state) => ([...state, { file, thumbnail }]))
        }

        setLoading(false)
        setFileData(dataArray)

    }

    const isValid = (file) => {

        let ext = file.name.slice(file.name.lastIndexOf('.'))

        if (!ACCEPT_FILES.includes(ext.toLowerCase())) {
            return false
        } else if ('') { // validate for size / quality
            return false
        }

        return true
    }

    const getUrlsAndUpload = async () => {
        const { album_id, startAtOrder } = payload

        setUploading(true)
        let res = await photoService.uploadPhotos({ user_id: userInfo.id, files: fileData, album_id, startAtOrder })
        const promiseArray = []
        for (const obj of res.data) {
            let { file, thumbnail } = loaded.find(({ file }) => file.tempId === obj.tempId)
            setUploadStatus(obj.tempId, UPLOAD_STATUS.PENDING)
            let pending = uploadWithSignedUrl({ url: obj.url, file, thumbnailUrl: obj.thumbnailUrl, thumbnail, name: obj.name })
            promiseArray.push(pending)
        }
        Promise.allSettled(promiseArray)
            .then((res) => {

                for (const obj of res) {
                    if (obj.status === 'fulfilled') {
                        confirmUpload({ name: obj.value })
                    }
                }

                payload.onUploadDone?.()
                toggle({ popupType: 'UploadDone', payload })
            })
    }

    const uploadWithSignedUrl = async ({ url, file, thumbnailUrl, thumbnail, name }) => {

        fetch(thumbnailUrl, {
            method: 'PUT',
            body: thumbnail,
            headers: {
                'Content-Type': thumbnail.type,
            }
        })
            .then((res) => {
                if (res.ok) {
                    console.log('thumbnail uploaded', res);
                } else {
                    console.log('thumbnail upload FAILED', res);
                }
            })
            .catch((err) => console.log('thumbnail upload error', err))

        try {
            const res = await fetch(url, {
                method: 'PUT',
                body: file,
                headers: {
                    'Content-Type': file.type,
                }
            })

            if (res.ok) {
                setUploadStatus(file.tempId, UPLOAD_STATUS.SUCCESS)
                return name
            } else {
                console.log('error', res);
                setUploadStatus(file.tempId, UPLOAD_STATUS.FAILED)
                deleteWhenFailed(name)
            }
        } catch (err) {
            console.log('upload fetch error', err);
            setUploadStatus(file.tempId, UPLOAD_STATUS.FAILED)
            deleteWhenFailed(name)
        }
    }

    const setUploadStatus = (id, status) => {
        setLoaded((state) => {

            let newState = state.map(({ file, thumbnail }) => {
                if (file.tempId == id) return { file: { ...file, uploaded: status }, thumbnail }
                else return { file, thumbnail }
            })

            return newState
        })
    }

    const confirmUpload = async ({ name }) => {
        try {
            photoService.confirmUpload({ name })
        } catch (error) {
            console.log('confirmUpload', error);
        }
    }

    const deleteWhenFailed = (name) => {
        photoService.deleteFailedUpload({ name })
            .catch((error) => {
                console.log('deleteFailedUpload', error);
            })
    }

    const tempContent = {
        upload_title: 'upload',
        upload_uploadButton: 'upload $n file(s)',
        upload_selectPhotos: 'browse'
    }

    return (
        <div className='upload-wrapper'>
            <div className='upload-top-row'>
                <button className='upload-close' onClick={() => toggle()}>{"+"}</button>
            </div>
            <span className='upload-title'>
                {tempContent.upload_title}
            </span>

            <div className='upload-input-container'>
                <label className='upload-input-label' htmlFor='upload-input' >
                    <span>{tempContent.upload_selectPhotos}</span>
                    <input
                        type='file'
                        id='upload-input'
                        multiple
                        accept={ACCEPT_FILES.join(', ')}
                        disabled={uploading}
                        onChange={onFileLoad}
                    />
                </label>

                <div className='upload-spinner-container'>
                    {loading ? <Spinner className='upload-spinner' /> : ''}
                </div>
            </div>

            <div className='upload-list-container'>
                {loaded.map(({ file, thumbnail }, idx) => (
                    <div key={idx.toString()} className='upload-list-item'>
                        <img className='upload-list-item-img' src={thumbnail?.preview} />
                        <span className='upload-list-item-name'>{thumbnail.name?.split?.('.')?.[0]}</span>
                        {/* <span>{`valid: ${file.isValid}`}</span> */}
                        {file.uploaded === UPLOAD_STATUS.SUCCESS ?
                            <img src={checkmark} className='upload-list-item-success' /> :
                            file.uploaded === UPLOAD_STATUS.FAILED ?
                                <img src={failed} className='upload-list-item-failed' /> :
                                file.uploaded === UPLOAD_STATUS.PENDING ?
                                    <Spinner className='upload-list-item-pending' /> : ''}
                    </div>
                ))}
            </div>

            <div className='upload-submit-container'>
                <button className='upload-submit' disabled={!loaded.length || uploading || loading} onClick={getUrlsAndUpload}>
                    {tempContent.upload_uploadButton.replace('$n', loaded.length)}
                </button>
                <div className='upload-submit-spinner-container'>
                    {uploading ? <Spinner className='upload-submit-spinner' /> : ''}
                </div>
            </div>
        </div>
    )
}

export default UploadPopup