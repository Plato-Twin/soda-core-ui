import React, { useState, useRef } from 'react'
import './index.less'
import { Upload, message } from 'antd'
import CommonButton from '../../Button'
import { addTokenToFav } from '@soda/soda-core'
import { mintAndShare } from '@/utils/token'

interface IProps {
  address: string
  app: string
  publishFunc?: () => void
}
export default (props: IProps) => {
  const { address, app, publishFunc } = props
  const [submitting, setSubmitting] = useState(false)
  const [localImg, setLocalImg] = useState<any>([])
  const ref = useRef<HTMLDivElement>(null)

  const beforeUpload = (file: any) => {
    setLocalImg([file])
    const preview = document.getElementById('preview') as HTMLImageElement
    preview.src = URL.createObjectURL(file)
    preview.onload = function () {
      URL.revokeObjectURL(preview.src) // free memory
    }
    return false
  }

  const onRemove = () => {
    setLocalImg([])
  }

  const handleFinish = async () => {
    if (!address) {
      message.warning('Wallet not found. Please install metamask first.')
      return
    }
    // mint
    try {
      if (localImg && localImg[0]) {
        setSubmitting(true)
        let response = await mintAndShare(localImg[0])
        if (response.error) {
          setSubmitting(false)
          return
        }
        //add to fav
        await addTokenToFav({ address, token: response.token })
        publishFunc()
        setSubmitting(false)
        // await pasteShareTextToEditor(app);
      } else {
        message.warning('Please select local image to mint your NFT')
        return
      }
    } catch (err) {
      console.error('[core-ui] UploadToken handleFinish', err)
      setSubmitting(false)
      message.error('Wallet issue/Balance issue')
    }
  }
  return (
    <div className="mint-container">
      <img src={chrome.extension.getURL('images/upload.png')} alt="" />
      <p>Select local images to mint NFT</p>
      <Upload
        capture=""
        accept=".jpg,.jpeg,.png"
        beforeUpload={beforeUpload}
        onRemove={onRemove}
        fileList={localImg}>
        <CommonButton type="primary" className="btn-upload">
          Select local image
        </CommonButton>
      </Upload>
      <div className="btn-footer">
        <CommonButton
          type="secondary"
          onClick={handleFinish}
          className="btn-finish"
          loading={submitting}>
          Finish
        </CommonButton>
      </div>
    </div>
  )
}
