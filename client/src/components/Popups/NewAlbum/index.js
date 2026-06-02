import { useContext, useState } from "react";
import { PopupContext } from "../../../Contexts/PopupContext";
import { TextContext } from "../../../Contexts/TextContext";
import InputField from "../../InputField";
import Spinner from '../../Spinner'
import Toggle from "../../Toggle";
import { photoService } from "../../../services/photoService";
import './new-album.scss'

const NewAlbum = () => {

    const { toggle, payload } = useContext(PopupContext)
    const { texts } = useContext(TextContext)
    const compTexts = JSON.parse(texts['NewAlbum'] || '{}')
    const [aiMode, setAiMode] = useState(true)
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
            setError(compTexts.NewAlbum_errorText)
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
                setError(res.data.userHint || compTexts.NewAlbum_noMatchText)
                setLoading(false)
                return
            }

            payload?.addNewlyCreatedAlbum?.(res.data?.newAlbum)

            toggle()

        } catch (error) {
            console.log('createNewAlbum', error);
            setError(compTexts.NewAlbum_errorText)
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

    return (
        <div className="new-album-popup-wrapper">
            <button className="new-album-close" onClick={() => toggle()}>+</button>

            <span className="new-album-title">{compTexts.NewAlbum_title}</span>

            {/* <Toggle value={aiMode ? 'smart' : 'manual'} modes={['manual', 'smart']} onChange={() => setAiMode(!aiMode)} /> */}
            <Toggle
                value={aiMode ? 'smart' : 'manual'}
                modes={[{ value: 'manual', text: compTexts.NewAlbum_manual }, { value: 'smart', text: compTexts.NewAlbum_smart }]}
                onChange={() => setAiMode(!aiMode)}
            />


            <span className="album-type-title">{aiMode ? compTexts.NewAlbum_smartAlbumTitle : compTexts.NewAlbum_manualAlbumTitle}</span>

            <div className="new-album-fields">

                {aiMode ? (
                    <div className="new-album-field">
                        <InputField label={''} className=''>
                            <textarea className="ai-prompt-input" placeholder={compTexts.NewAlbum_smartAlbumPrompt} value={prompt} onChange={handlePromptInput} />
                        </InputField>
                    </div>
                ) : (
                    <>
                        {/* <div className="new-album-field">
                            <label htmlFor='newAlbum-name'>{compTexts.NewAlbum_name} *</label>
                            <input id="newAlbum-name" type="text" disabled={loading} value={inputs.name} onChange={handleInputs} />
                        </div>

                        <div className="new-album-field">
                            <label htmlFor='newAlbum-description' >{compTexts.NewAlbum_description}</label>
                            <textarea id="newAlbum-description" disabled={loading} value={inputs.description} onChange={handleInputs} />
                        </div> */}


                        <div className="new-album-field">

                            <InputField label={compTexts.NewAlbum_name} className=''  >
                                <input id="newAlbum-name" type="text" disabled={loading} value={inputs.name} onChange={handleInputs} />
                            </InputField>
                        </div>


                        <div className="new-album-field">
                            <InputField label={compTexts.NewAlbum_description} className='' >
                                <textarea id="newAlbum-description" disabled={loading} value={inputs.description} onChange={handleInputs} />
                            </InputField>
                        </div>


                    </>)}
            </div>


            <div className="new-album-submit-container">
                <button className="new-album-submit" disabled={(aiMode ? !prompt : !inputs.name) || loading} onClick={submit}>{compTexts.NewAlbum_submit}</button>
                <div className="new-album-spinner-container">
                    {loading ? <Spinner className='spinner' /> : ''}
                </div>
            </div>

            {error ? <span className="error-text">{error}</span> : ''}
        </div>
    )
}

export default NewAlbum