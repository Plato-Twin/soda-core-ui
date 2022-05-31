import React, { useState, useEffect, useMemo } from 'react'
import * as ReactDOM from 'react-dom'
import './index.less'
import {
  NFT,
  getAddress,
  getBindResult,
  addTokenToFav,
  getFavTokens,
  getRole,
  getTokenSource,
  generateTokenMask,
  BindInfo,
  CollectionDao,
  appInvoke,
  AppFunction,
  getCollectionDaoByToken,
  getInlineMarketplace
} from '@soda/soda-core'
import { Popover, message, Button } from 'antd'
import { ArrowRightOutlined } from '@ant-design/icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHamburger } from '@fortawesome/free-solid-svg-icons'
import ProposalModal from '../ProposalModal'
import { openExtensionPage } from '@/utils/chrome'
import { mintAndShare } from '@/utils/token'
import { saveLocal, StorageKeys } from '@/utils/storage'
import { newPostTrigger } from '@/utils/handleShare'
import IconExpand from '../../assets/images/icon-expand.png'
import IconShrink from '../../assets/images/icon-shrink.png'
import IconFav from '../../assets/images/icon-fav.png'
import IconMarket from '../../assets/images/icon-market.png'
import IconMinterRole from '../../assets/images/icon-minter-role.png'
import IconMinter from '../../assets/images/icon-minter.png'
import IconOwnerRole from '../../assets/images/icon-owner-role.png'
import IconOwner from '../../assets/images/icon-owner.png'
import IconMinterOwner from '../../assets/images/icon-minter-owner.png'
import IconShare from '../../assets/images/icon-share.png'
import IconSource from '../../assets/images/icon-source.png'
import IconDao from '../../assets/images/icon-dao.svg'
import IconProposal from '../../assets/images/icon-proposal.svg'
import { IconShareFB, IconShareTwitter } from './icon'

function InlineTokenToolbar(props: {
  token?: NFT
  originImgSrc: string
  app?: string
  username?: string
}) {
  const [isInFav, setIsInFav] = useState(false)
  const [mintLoading, setMintLoading] = useState(false)
  const [showMenuMore, setShowMenuMore] = useState(false)
  const [minterAccount, setMinterAccount] = useState<BindInfo[]>([])
  const [ownerAccount, setOwnerAccount] = useState<BindInfo[]>([])
  const [address, setAddress] = useState('')
  const [collectionDao, setCollectionDao] = useState<CollectionDao>()
  const [proposalModalShow, setProposalModalShow] = useState(false)
  const { token, app, username } = props

  const isOwner = useMemo(() => {
    if (
      username &&
      app &&
      ownerAccount.find(
        (item) => item.appid === username && item.application === app
      )
    ) {
      return true
    } else {
      return false
    }
  }, [username, ownerAccount])

  const isMinter = useMemo(() => {
    if (
      username &&
      app &&
      minterAccount.find(
        (item) => item.appid === username && item.application === app
      )
    ) {
      return true
    } else {
      return false
    }
  }, [minterAccount, username])

  const isBothMinterOwner = useMemo(() => {
    return isOwner && isMinter
  }, [isOwner, isMinter])

  const fetchInfo = async () => {
    let role: { owner?: string; minter?: string }
    if (!token.owner) {
      role = await getRole({ token })
      token.owner = role.owner
      token.minter = role.minter
    }

    const ownerBindResult =
      (await getBindResult({
        address: role.owner
      })) || []
    const bindings = ownerBindResult.filter((item) => item.contentId)
    setOwnerAccount(bindings)

    const minterBindResult =
      (await getBindResult({
        address: role.minter
      })) || []
    const minterBindings = minterBindResult.filter((item) => item.contentId)
    setMinterAccount(minterBindings)
  }

  useEffect(() => {
    ;(async () => {
      const address = await getAddress()
      setAddress(address)
      if (props.token) {
        fetchInfo()
        const favTokens = await getFavTokens({
          address,
          chainId: token.chainId,
          contract: token.contract
        })
        if (
          favTokens.data.some((item) => '' + item.tokenId === token.tokenId)
        ) {
          setIsInFav(true)
        }
        fetchCollectionInfo()
      }
    })()
  }, [props.token])

  const getWeb2UserHomepage = async (data: BindInfo[]) => {
    let uri = ''
    for (const item of data) {
      let u: any
      try {
        u = await appInvoke(item.application, AppFunction.getUserPage, {
          appid: item.appid
        })
      } catch (e) {
        u = null
      }
      if (u) uri = u
      // hook, twitter by default
      if (item.application === 'Twitter') break
    }
    return uri
  }
  const handleToMinterWeb2 = async (e) => {
    e.stopPropagation()
    if (minterAccount.length > 0) {
      const uri = await getWeb2UserHomepage(minterAccount)
      window.open(uri, '_blank')
    }
  }
  const handleToOwnerWeb2 = async (e) => {
    e.stopPropagation()
    if (ownerAccount.length > 0) {
      const uri = await getWeb2UserHomepage(ownerAccount)
      window.open(uri, '_blank')
    }
  }
  const handleToSource = async (e) => {
    e.stopPropagation()
    const source = await getTokenSource(token)
    window.open(source, '_blank')
  }
  const handleToMarket = async (e) => {
    e.stopPropagation()
    const { url } = await getInlineMarketplace(token)
    window.open(url)
  }
  const handleMint = async () => {
    if (!address) {
      message.warning('Wallet not found. Please install metamask.')
      return
    }
    setMintLoading(true)
    const response = await mintAndShare(props.originImgSrc)
    setMintLoading(false)
    if (response.error) {
      return
    }
    newPostTrigger(app)
    // await pasteShareTextToEditor(app)
  }

  const handleShare = async () => {
    //TODO, temp save
    const mask = generateTokenMask(token)
    await saveLocal(StorageKeys.SHARING_NFT_META, mask)
    // FIXME: hardcode for now
    const targetUrl = window.location.href.includes('twitter')
      ? 'https://www.facebook.com'
      : 'https://twitter.com'
    window.open(targetUrl, '_blank')
  }

  const shareContent = () => (
    <div className="img-mask-share">
      <ul>
        <li>
          <IconShareTwitter
            onClick={handleShare}
            disabled={window.location.href.includes('twitter')}
          />
        </li>
        <li>
          <IconShareFB
            onClick={handleShare}
            disabled={window.location.href.includes('facebook')}
          />
        </li>
      </ul>
    </div>
  )
  const handleAddToFav = async (e) => {
    e.stopPropagation()
    try {
      const address = await getAddress()
      await addTokenToFav({ address, token })
      setIsInFav(true)
      message.success('Add to favorite successful!')
    } catch (err) {
      console.error(err)
      message.error('Add to favorite failed.')
    }
  }

  const fetchCollectionInfo = async () => {
    const collection = await getCollectionDaoByToken(token) // TODO:get contract from meta
    setCollectionDao(collection)
  }

  const handleToDaoPage = async (e: any) => {
    e.stopPropagation()
    openExtensionPage(`daoDetail?dao=${collectionDao.collection.id}`)
  }

  const onCloseProposalModal = () => {
    setProposalModalShow(false)
  }

  const handleToProposal = (e: any) => {
    e.stopPropagation()
    setProposalModalShow(true)
  }

  return (
    <div className="img-mask-container">
      <div className="img-mask-icon">
        {/* {!token && (
          <Popover content="Mint">
            <FontAwesomeIcon
              style={{ cursor: 'pointer' }}
              icon={faHamburger}
              onClick={(e) => {
                e.stopPropagation()
                handleMint()
              }}
            />
          </Popover>
        )} */}

        {token && !showMenuMore && (
          <Popover content="Expand toolbar">
            <div
              className="toolbar-icon"
              onClick={(e) => {
                e.stopPropagation()
                setShowMenuMore(true)
              }}>
              <img src={IconExpand} alt="" />
            </div>
          </Popover>
        )}

        {showMenuMore && (
          <div className="img-mask-icon-list" style={{ display: 'flex' }}>
            {token && (
              <Popover content="Shrink toolbar">
                <div
                  className="toolbar-icon"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowMenuMore(false)
                  }}>
                  <img src={IconShrink} alt="" />
                </div>
              </Popover>
            )}
            {token && token.source && (
              <Popover content="View source">
                <div className="toolbar-icon" onClick={handleToSource}>
                  <img src={IconSource} alt="" />
                </div>
              </Popover>
            )}
            {token && (
              <Popover
                placement="bottom"
                title={'Share'}
                content={shareContent}
                trigger="hover"
                overlayClassName="toolbar-share"
                className="toolbar-share">
                <div className="toolbar-icon">
                  <img src={IconShare} alt="" />
                </div>
              </Popover>
            )}

            {
              <Popover content={'To market'}>
                <div className="toolbar-icon" onClick={handleToMarket}>
                  <img src={IconMarket} alt="" />
                </div>
              </Popover>
            }

            {address && token && !isInFav && (
              <Popover content="Add to fav">
                <div className="toolbar-icon" onClick={handleAddToFav}>
                  <img src={IconFav} alt="" />
                </div>
              </Popover>
            )}

            {!isBothMinterOwner && !isOwner && ownerAccount.length > 0 && (
              <Popover content="View owner">
                <div className="toolbar-icon" onClick={handleToOwnerWeb2}>
                  <img src={IconOwner} alt="" />
                </div>
              </Popover>
            )}
            {!isBothMinterOwner && !isMinter && minterAccount.length > 0 && (
              <Popover content="View minter">
                <div className="toolbar-icon" onClick={handleToMinterWeb2}>
                  <img src={IconMinter} alt="" />
                </div>
              </Popover>
            )}
            {collectionDao && (
              <Popover content="DAO">
                <div className="toolbar-icon" onClick={handleToDaoPage}>
                  <img src={IconDao} alt="" />
                </div>
              </Popover>
            )}
            {collectionDao && (
              <Popover content="Proposal">
                <div className="toolbar-icon" onClick={handleToProposal}>
                  <img src={IconProposal} alt="" />
                </div>
              </Popover>
            )}
          </div>
        )}
        {!isBothMinterOwner && isOwner && (
          <Popover content="This is the owner">
            <div className="toolbar-icon" onClick={handleToOwnerWeb2}>
              <img src={IconOwnerRole} alt="" />
            </div>
          </Popover>
        )}
        {!isBothMinterOwner && isMinter && (
          <Popover content="This is the minter">
            <div className="toolbar-icon" onClick={handleToMinterWeb2}>
              <img src={IconMinterRole} alt="" />
            </div>
          </Popover>
        )}
        {isBothMinterOwner && (
          <Popover content="This is the minter & owner">
            <div className="toolbar-icon" onClick={handleToMinterWeb2}>
              <img src={IconMinterOwner} />
            </div>
          </Popover>
        )}
      </div>
      <ProposalModal
        show={proposalModalShow}
        onClose={onCloseProposalModal}
        collectionDao={collectionDao}
      />
    </div>
  )
}

export default InlineTokenToolbar
