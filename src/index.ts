import CoreInit from '@soda/soda-core'

import Button from './components/Button'
import MediaCacheDisplay from './components/MediaCacheDisplay'
import InlineTokenToolbar from './components/InlineTokenToolbar'
import InlineApplicationBindBox from './components/InlineApplicationBindBox'
import ListNoData from './components/ListNoData'
import ResourceDialog from './components/ResourceDialog'
import FavTokenList from './components/ResourceDialog/FavTokenList'
import OwnedTokenList from './components/ResourceDialog/OwnedTokenList'
import UploadToken from './components/ResourceDialog/UploadToken'
import { startWatch } from './utils/watcher'
import { saveLocal, getLocal, removeLocal, StorageKeys } from './utils/storage'
import { CustomEventId, dispatchCustomEvents } from './utils/common'
import {
  removeTextInSharePost,
  POST_SHARE_TEXT,
  postShareHandler
} from './utils/handleShare'
import { dispatchPaste } from './utils/eventDispatch'
import { mint } from './utils/token'

export {
  startWatch,
  saveLocal,
  getLocal,
  removeLocal,
  StorageKeys,
  CustomEventId,
  dispatchCustomEvents,
  postShareHandler,
  removeTextInSharePost,
  dispatchPaste,
  Button,
  MediaCacheDisplay,
  InlineTokenToolbar,
  InlineApplicationBindBox,
  ListNoData,
  ResourceDialog,
  FavTokenList,
  OwnedTokenList,
  UploadToken,
  POST_SHARE_TEXT,
  mint
}

import { bgInit as chromeBgInit } from './utils/chrome'
export const bgInit = () => {
  chromeBgInit()
}
