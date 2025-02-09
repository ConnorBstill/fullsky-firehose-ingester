/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { ValidationResult, BlobRef } from '@atproto/lexicon'
import { lexicons } from '../../../lexicons'
import { isObj, hasProp } from '../../../util'
import { CID } from 'multiformats/cid'
import * as AppBskyEmbedImages from '../../app/bsky/embed/images'
import * as AppBskyEmbedVideo from '../../app/bsky/embed/video'
import * as AppBskyEmbedExternal from '../../app/bsky/embed/external'
import * as AppBskyEmbedRecord from '../../app/bsky/embed/record'
import * as AppBskyEmbedRecordWithMedia from '../../app/bsky/embed/recordWithMedia'
import * as ComAtprotoLabelDefs from '../atproto/label/defs'

export interface Record {
  body: string
  embed?:
    | AppBskyEmbedImages.Main
    | AppBskyEmbedVideo.Main
    | AppBskyEmbedExternal.Main
    | AppBskyEmbedRecord.Main
    | AppBskyEmbedRecordWithMedia.Main
    | { $type: string; [k: string]: unknown }
  /** Indicates human language of post primary text content. */
  langs?: string[]
  labels?:
    | ComAtprotoLabelDefs.SelfLabels
    | { $type: string; [k: string]: unknown }
  /** Additional hashtags, in addition to any included in post text and facets. */
  tags?: string[]
  createdAt: string
  [k: string]: unknown
}

export function isRecord(v: unknown): v is Record {
  return (
    isObj(v) &&
    hasProp(v, '$type') &&
    (v.$type === 'com.fullsky.post#main' || v.$type === 'com.fullsky.post')
  )
}

export function validateRecord(v: unknown): ValidationResult {
  return lexicons.validate('com.fullsky.post#main', v)
}
