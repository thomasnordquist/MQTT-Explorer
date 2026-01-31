import { expect } from 'chai'
import { SceneBuilder, SCENE_TITLES } from './SceneBuilder'

describe('SceneBuilder', () => {
  it('should record scenes with titles', async () => {
    const builder = new SceneBuilder()

    await builder.record('connect', async () => {
      // Simulate some work
      await new Promise(resolve => setTimeout(resolve, 100))
    })

    expect(builder.scenes).to.have.length(1)
    expect(builder.scenes[0].name).to.equal('connect')
    expect(builder.scenes[0].title).to.equal('Connecting to MQTT Broker')
    expect(builder.scenes[0].duration).to.be.greaterThan(90)
  })

  it('should have titles for all scene types', () => {
    const sceneNames = Object.keys(SCENE_TITLES)
    expect(sceneNames.length).to.be.greaterThan(0)

    // Verify each scene has a non-empty title
    sceneNames.forEach(name => {
      expect(SCENE_TITLES[name as keyof typeof SCENE_TITLES]).to.be.a('string')
      expect(SCENE_TITLES[name as keyof typeof SCENE_TITLES].length).to.be.greaterThan(0)
    })
  })

  it('should record multiple scenes in sequence', async () => {
    const builder = new SceneBuilder()

    await builder.record('connect', async () => {
      await new Promise(resolve => setTimeout(resolve, 50))
    })

    await builder.record('numeric_plots', async () => {
      await new Promise(resolve => setTimeout(resolve, 50))
    })

    expect(builder.scenes).to.have.length(2)
    expect(builder.scenes[0].name).to.equal('connect')
    expect(builder.scenes[0].title).to.equal('Connecting to MQTT Broker')
    expect(builder.scenes[1].name).to.equal('numeric_plots')
    expect(builder.scenes[1].title).to.equal('Plot Topic History')

    // Second scene should start at or after first one ends
    expect(builder.scenes[1].start).to.be.at.least(builder.scenes[0].stop)
  })
})
