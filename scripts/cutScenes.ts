#!/usr/bin/env tsx
import * as fs from 'fs'
// @ts-ignore - ffmpeg-concat doesn't have type definitions and is not required for build
import concat from 'ffmpeg-concat'
import { exec } from './util'
import { Scene, SceneNames } from '../src/spec/SceneBuilder'

// @ts-ignore - ffmpeg-concat doesn't have type definitions

async function cutScenes(scenes: Array<Scene>) {
  for (const scene of scenes) {
    const outputFile = `${scene.name}.mp4`
    if (fs.existsSync(outputFile)) {
      fs.unlinkSync(outputFile)
    }

    await exec(
      'ffmpeg',
      `-i app2.mp4 -ss ${scene.start / 1000} -t ${scene.duration / 1000} ${scene.name}.mp4`.split(' ')
    )
  }
}

type Transistions = 'none' | 'pixelize' | 'cube' | 'directionalWarp' | 'hexagonalize'

class TransitionBuilder {
  private scenes: Array<string> = []

  private transitions: Array<string> = []

  public startWith(scene: SceneNames): TransitionBuilder {
    this.scenes.push(scene)
    return this
  }

  public transitionTo(scene: SceneNames, transition: Transistions): TransitionBuilder {
    this.scenes.push(scene)
    this.transitions.push(transition)
    return this
  }

  public buildOptions(outputFile: string) {
    return {
      output: outputFile,
      videos: this.scenes.map(s => `${s}.mp4`),
      transitions: this.transitions.map(name => ({
        name: name !== 'none' ? name : 'fade',
        duration: name !== 'none' ? 1000 : 10,
      })),
    }
  }
}

// const scenes: Array<Scene> = JSON.parse(fs.readFileSync('./scenes.json').toString())
// cutScenes(scenes)
const builder = new TransitionBuilder()
  .startWith('connect')
  .transitionTo('numeric_plots', 'cube')
  .transitionTo('diffs', 'pixelize')
  .transitionTo('customize_subscriptions', 'hexagonalize')

concat(builder.buildOptions('test.mp4'))
