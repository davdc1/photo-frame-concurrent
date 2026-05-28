import { useContext, useState } from "react";
import { PopupContext } from "../../../Contexts/PopupContext";
import Toggle from "../../Toggle";
import InputField from "../../InputField";
import { photoService } from "../../../services/photoService";
import Spinner from '../../Spinner'
import './new-album.scss'

const NewAlbum = () => {

    const { toggle, payload } = useContext(PopupContext)
    const [aiMode, setAiMode] = useState(false)
    const [inputs, setInputs] = useState({ name: '', description: '' })
    const [prompt, setPrompt] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const submit = () => {
        if (aiMode) {
            submitSmartAlbum()
        } else {
            submitManual()
        }
    }

    const submitManual = async () => {
        try {
            if (!inputs.name) return

            setError('')
            setLoading(true)

            const { name, description } = inputs
            let res = await photoService.createNewAlbum({ name, description })

            payload?.addNewlyCreatedAlbum?.(res.data)

            toggle()

        } catch (error) {
            console.log('createNewAlbum', error);
            setError(tempTexts.NewAlbum_errorText)
        }

        setLoading(false)

    }

    const submitSmartAlbum = async () => {

        try {
            if (!prompt) return

            setError('')
            setLoading(true)

            let res = await photoService.llmCreateAlbum({ text: prompt })

            if (res.data.noMatch) {
                setError(res.data.userHint || tempTexts.NewAlbum_noMatchText)
                setLoading(false)
                return
            }

            payload?.addNewlyCreatedAlbum?.(res.data?.newAlbum)

            toggle()

        } catch (error) {
            console.log('createNewAlbum', error);
            setError(tempTexts.NewAlbum_errorText)
        }

        setLoading(false)

    }

    const handleInputs = ({ target }) => {
        let field = target.id.split('-')[1]
        setInputs((prev) => ({ ...prev, [field]: target.value }))
    }

    const handlePromptInput = ({ target }) => {
        setPrompt(target.value)
    }

    const tempTexts = {
        NewAlbum_title: 'New Album',
        NewAlbum_name: 'Name',
        NewAlbum_description: 'Description',
        NewAlbum_submit: 'Submit',
        NewAlbum_errorText: 'an error occurred',
        NewAlbum_noMatchText: 'no matching photos found',
        NewAlbum_smartAlbumTitle: 'Smart Album',
        NewAlbum_smartAlbumPrompt: 'Describe photos by time, location, or content.\ne.g. "Beach in July 2024", "Sunsets in Greece", "Mountains"'
    }
    return (
        <div className="new-album-popup-wrapper">
            <button className="new-album-close" onClick={() => toggle()}>+</button>

            <Toggle value={aiMode ? 'smart' : 'manual'} modes={['manual', 'smart']} onChange={() => setAiMode(!aiMode)} />



            {/* <span className="new-album-title">{tempTexts.NewAlbum_smartAlbumTitle}</span>
                    <textarea className="ai-prompt-input" placeholder="Describe the album you want to create..." value={prompt} onChange={handlePromptInput} /> */}



            <span className="new-album-title">{aiMode ? '' : tempTexts.NewAlbum_title}</span>


            <div className="new-album-fields">

                {aiMode ? (
                    <div className="new-album-field">
                        <InputField label={tempTexts.NewAlbum_smartAlbumTitle} className=''>
                            <textarea className="ai-prompt-input" placeholder={tempTexts.NewAlbum_smartAlbumPrompt} value={prompt} onChange={handlePromptInput} />
                        </InputField>
                    </div>
                ) : (
                    <>
                        {/* <div className="new-album-field">
                            <label htmlFor='newAlbum-name'>{tempTexts.NewAlbum_name} *</label>
                            <input id="newAlbum-name" type="text" disabled={loading} value={inputs.name} onChange={handleInputs} />
                        </div>

                        <div className="new-album-field">
                            <label htmlFor='newAlbum-description' >{tempTexts.NewAlbum_description}</label>
                            <textarea id="newAlbum-description" disabled={loading} value={inputs.description} onChange={handleInputs} />
                        </div> */}


                        <div className="new-album-field">

                            <InputField label={tempTexts.NewAlbum_name} className=''  >
                                <input id="newAlbum-name" type="text" disabled={loading} value={inputs.name} onChange={handleInputs} />
                            </InputField>
                        </div>


                        <div className="new-album-field">
                            <InputField label={tempTexts.NewAlbum_description} className='' >
                                <textarea id="newAlbum-description" disabled={loading} value={inputs.description} onChange={handleInputs} />
                            </InputField>
                        </div>


                    </>)}
            </div>


            <div className="new-album-submit-container">
                <button className="new-album-submit" disabled={(aiMode ? !prompt : !inputs.name) || loading} onClick={submit}>{tempTexts.NewAlbum_submit}</button>
                <div className="new-album-spinner-container">
                    {loading ? <Spinner className='spinner' /> : ''}
                </div>
            </div>

            {error ? <span className="error-text">{error}</span> : ''}
        </div>
    )
}

export default NewAlbum