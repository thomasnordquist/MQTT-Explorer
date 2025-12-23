import { expect } from 'chai'
import { ConfigMigrator } from '../ConfigMigrator'
import 'mocha'

describe('ConfigMigrator', () => {
  it('applies migrations to a subject with undefined configVersion', () => {
    let migrator = new ConfigMigrator([
      {
        from: undefined,
        apply: subject => {
          return {
            ...subject,
            configVersion: 1,
            drink: 'Beer',
          }
        },
      },
    ])

    let config = {
      drink: 'water',
    }

    let migratedConfig = migrator.applyMigrations(config as any) as any

    expect(migratedConfig.drink).to.eq('Beer')
    expect(migratedConfig.configVersion).to.eq(1)
  })

  it('applies multiple migrations from the same version', () => {
    let migrator = new ConfigMigrator([
      {
        from: undefined,
        apply: subject => {
          return {
            ...subject,
            drink: 'Beer',
          }
        },
      },
      {
        from: undefined,
        apply: subject => {
          return {
            ...subject,
            configVersion: 1,
          }
        },
      },
    ])

    let config = {
      drink: 'water',
    }

    let migratedConfig = migrator.applyMigrations(config as any) as any

    expect(migratedConfig.drink).to.eq('Beer')
    expect(migratedConfig.configVersion).to.eq(1)
  })

  it('applies multiple migrations with ascending versions', () => {
    let migrator = new ConfigMigrator([
      {
        from: undefined,
        apply: subject => {
          return {
            ...subject,
            configVersion: 1,
          }
        },
      },
      {
        from: 1,
        apply: subject => {
          return {
            ...subject,
            configVersion: 2,
          }
        },
      },
    ])

    let config = {
      drink: 'water',
    }

    let migratedConfig = migrator.applyMigrations(config as any)

    expect(migratedConfig.configVersion).to.eq(2)
  })

  it('does not apply non-matching migrations', () => {
    let migrator = new ConfigMigrator([
      {
        from: 2,
        apply: subject => {
          return {
            ...subject,
            configVersion: 3,
          }
        },
      },
    ])

    let config = {
      configVersion: 10,
      drink: 'water',
    }

    let migratedConfig = migrator.applyMigrations(config as any)

    expect(migratedConfig.configVersion).to.eq(10)
  })
})
