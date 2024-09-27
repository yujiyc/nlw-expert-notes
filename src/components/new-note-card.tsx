import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { ChangeEvent, MouseEvent, useState } from 'react'
import { toast } from 'sonner'

type NewNoteCardProps = {
  onNoteCreated: (content: string) => void
}

let speechRecognition: SpeechRecognition | null = null

export const NewNoteCard = ({ onNoteCreated }: NewNoteCardProps) => {
  const [shouldShowOnboarding, setShouldShowOnboarding] = useState(true)
  const [content, setContent] = useState('')
  const [isRecording, setIsRecording] = useState(false)

  function handleStartEditor() {
    setShouldShowOnboarding(false)
  }

  function handleContentChanged(event: ChangeEvent<HTMLTextAreaElement>) {
    const value = event.target.value

    setContent(value)

    if (value === '') {
      setShouldShowOnboarding(true)
    }
  }

  function handleSaveNote(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault()

    if (content.trim() === '') {
      return toast.error('A nota não pode ser vazia!')
    }

    onNoteCreated(content)

    setContent('')
    setShouldShowOnboarding(true)

    toast.success('Nota criada com sucesso!')
  }

  function handleStartRecording() {
    const isSpeechRecognitionAPIAvailable =
      'SpeechRecognition' in window || 'webkitSpeechRecognition' in window

    if (!isSpeechRecognitionAPIAvailable) {
      return toast.error(
        'Infelizmente seu navegador não suporta a API de gravação!',
      )
    }

    setIsRecording(true)
    setShouldShowOnboarding(false)

    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition

    speechRecognition = new SpeechRecognitionAPI()

    speechRecognition.lang = 'pt-BR' // Idioma do reconhecimento de fala
    speechRecognition.continuous = true // Para reconhecer continuamente a fala (só para de gravar se enviarmos o comando de parar)
    speechRecognition.maxAlternatives = 1 // Quantidade de palavras reconhecidas por vez (retorno de uma palavra mais próxima do que foi falado)
    speechRecognition.interimResults = true // Para tentar reconhecer palavras que ainda não foram faladas (tendo como contexto o que já foi dito anteriormente)

    // Função executada sempre que a API de gravação apresentar algum erro
    speechRecognition.onerror = (event) => {
      console.log(event)
    }

    // Função executada sempre que a API de gravação ouvir uma palavra
    speechRecognition.onresult = (event) => {
      const transcription = Array.from(event.results).reduce(
        (textAcc, result) => {
          return textAcc.concat(result[0].transcript)
        },
        '',
      )

      setContent(transcription)

      // console.log(event.results)
    }

    // Função que inicia a gravação
    speechRecognition.start()
  }

  function handleStopRecording() {
    setIsRecording(false)
    speechRecognition?.stop()

    if (content.trim() === '') {
      setShouldShowOnboarding(true)
    }
  }

  return (
    <Dialog.Root>
      <Dialog.Trigger className="flex flex-col gap-3 rounded-md bg-slate-700 p-5 text-left outline-none hover:ring-2 hover:ring-slate-600 focus-visible:ring-2 focus-visible:ring-lime-400">
        <span className="text-sm font-medium text-slate-200">
          Adicionar nota
        </span>
        <p className="text-sm leading-6 text-slate-400">
          Grave uma nota em áudio que será convertida para texto
          automaticamente.
        </p>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />

        <Dialog.Content className="fixed inset-0 flex w-full flex-col overflow-hidden bg-slate-700 outline-none md:inset-auto md:left-1/2 md:top-1/2 md:h-[60vh] md:max-w-[640px] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-md">
          <Dialog.Close className="absolute right-0 top-0 bg-slate-800 p-1.5 text-slate-500 hover:text-slate-100">
            <X className="size-5" />
          </Dialog.Close>

          <form className="flex flex-1 flex-col">
            <div className="flex flex-1 flex-col gap-3 p-5">
              <span className="text-sm font-medium text-slate-300">
                Adicionar nota
              </span>
              {shouldShowOnboarding ? (
                <p className="text-sm leading-6 text-slate-400">
                  Comece{' '}
                  <button
                    type="button"
                    onClick={handleStartRecording}
                    className="font-medium text-lime-400 hover:underline"
                  >
                    gravando uma nota
                  </button>{' '}
                  em áudio ou se preferir{' '}
                  <button
                    type="button"
                    onClick={handleStartEditor}
                    className="font-medium text-lime-400 hover:underline"
                  >
                    utilize apenas texto.
                  </button>
                </p>
              ) : (
                <textarea
                  autoFocus
                  value={content}
                  onChange={handleContentChanged}
                  className="flex-1 resize-none bg-transparent text-sm leading-6 outline-none"
                />
              )}
            </div>

            {isRecording ? (
              <button
                type="button"
                onClick={handleStopRecording}
                className="flex w-full items-center justify-center gap-2 bg-slate-800 py-4 text-center text-sm font-normal text-slate-300 hover:text-slate-100"
              >
                <div className="relative">
                  <div className="absolute size-2.5 animate-ping rounded-full bg-red-500" />
                  <div className="relative size-2.5 rounded-full bg-red-500" />
                </div>
                Gravando! (clique p/ interromper)
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSaveNote}
                className="w-full bg-lime-400 py-4 text-center text-sm font-semibold text-lime-950 hover:bg-lime-500"
              >
                Salvar nota
              </button>
            )}
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
