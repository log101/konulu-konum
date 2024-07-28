import { toast } from "@/lib/utils"
import { Button } from "./ui/button"

const ShareButton = () => {
  const shareLink = async () => {
    const shareData = {
      title: "Konulu Konum",
      text: "Sevdiklerinizi şaşırtın!",
      url: document.URL,
    }

    await navigator.share(shareData)
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(document.URL)
      toast("Konulu konum kopyalandı.")
    } catch (err: any) {
      console.error(err.message)
    }
  }

  return (
    <div>
      {
        //@ts-expect-error navigator is not always defined
        window.navigator.share ? (
          <Button className='w-full text-xl' size='lg' onClick={shareLink}>
            Paylaş
          </Button>
        ) : (
          <Button className='w-full text-xl' size='lg' onClick={copyLink}>
            Paylaş
          </Button>
        )
      }
    </div>
  )
}

export default ShareButton
