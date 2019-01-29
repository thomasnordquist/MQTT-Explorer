#!node_modules/.bin/ts-node
import axios from 'axios'
import * as fs from 'fs'
import * as path from 'path'
import * as mime from 'mime'

<<<<<<< HEAD
const tag = process.env.TRAVIS_TAG
=======
const tag = process.env.GIT_TAG
>>>>>>> Upload video assets
const githubToken = process.env.GH_TOKEN

async function latestUrl() {
  const response = await axios.get(`https://api.github.com/repos/thomasnordquist/mqtt-explorer/releases/latest?access_token=${githubToken}`)
  const latestRelease = response.data
  return cleanUploadUrl(response.data.upload_url)
}

async function tagUrl(tag: string): Promise<string | undefined> {
  const response = await axios.get(`https://api.github.com/repos/thomasnordquist/mqtt-explorer/releases?access_token=${githubToken}`)
  const tagRelease = response.data.find((release: any) => release.tag_name === tag)

  return tagRelease ? cleanUploadUrl(tagRelease.upload_url) : undefined
}

async function createDraft(tag: string) {
  console.log('create draft')

  const response = await axios({
    method: 'post',
    url: `https://api.github.com/repos/thomasnordquist/mqtt-explorer/releases?access_token=${githubToken}`,
    data: {
      tag_name: tag,
      name: tag.slice(1),
      draft: true,
    },
  })

  return cleanUploadUrl(response.data.upload_url)
}

function cleanUploadUrl(url: string) {
  return url.match(/(.*){/)![1]
}

async function uploadAsset() {
  const tag = 'v0.1.1'
  const files = process.argv.slice(2)

  if (!tag || files.length === 0) {
    console.log('Nothing to do')
  }

  let uploadUrl: string | undefined
  try {
    uploadUrl = await tagUrl(tag)
    if (!uploadUrl) {
      console.log('tag does not exist')
      try {
        uploadUrl = await createDraft(tag)
      } catch (error) {
        console.error('failed to create draft', error)
        process.exit(1)
      }
    }
  } catch (error) {
    console.error('failed to find tag release', error)
    process.exit(1)
  }

  if (uploadUrl) {
    console.log(uploadUrl)
    for (const file of files) {
      console.log('uploading file', file)
      await uploadFile(uploadUrl, file)
      console.log('upload completed')
    }
  }
}

async function uploadFile(uploadUrl: string, file: string) {
  const data = fs.readFileSync(file)
  const mimeType = mime.getType(path.extname(file))

  return await axios({
    data,
    method: 'post',
    url: `${uploadUrl}?name=${path.basename(file)}&access_token=${githubToken}`,
    headers: {
      'Content-Type': mimeType,
    },
  })
}

uploadAsset()
