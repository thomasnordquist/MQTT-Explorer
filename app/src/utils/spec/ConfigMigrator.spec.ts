import { expect } from 'chai'
import { ConfigMigrator } from '../ConfigMigrator'
import 'mocha'

describe('ConfigMigrator', () => {
  it('applies migrations to a subject with undefined configVersion', () => {
    const migrator = new ConfigMigrator([
      {
        from: undefined,
        apply: subject => ({
          ...subject,
          configVersion: 1,
          drink: 'Beer',
        }),
      },
    ])

    const config = {
      drink: 'water',
    }

    const migratedConfig = migrator.applyMigrations(config as any) as any

    expect(migratedConfig.drink).to.eq('Beer')
    expect(migratedConfig.configVersion).to.eq(1)
  })

  it('applies multiple migrations from the same version', () => {
    const migrator = new ConfigMigrator([
      {
        from: undefined,
        apply: subject => ({
          ...subject,
          drink: 'Beer',
        }),
      },
      {
        from: undefined,
        apply: subject => ({
          ...subject,
          configVersion: 1,
        }),
      },
    ])

    const config = {
      drink: 'water',
    }

    const migratedConfig = migrator.applyMigrations(config as any) as any

    expect(migratedConfig.drink).to.eq('Beer')
    expect(migratedConfig.configVersion).to.eq(1)
  })

  it('applies multiple migrations with ascending versions', () => {
    const migrator = new ConfigMigrator([
      {
        from: undefined,
        apply: subject => ({
          ...subject,
          configVersion: 1,
        }),
      },
      {
        from: 1,
        apply: subject => ({
          ...subject,
          configVersion: 2,
        }),
      },
    ])

    const config = {
      drink: 'water',
    }

    const migratedConfig = migrator.applyMigrations(config as any)

    expect(migratedConfig.configVersion).to.eq(2)
  })

  it('does not apply non-matching migrations', () => {
    const migrator = new ConfigMigrator([
      {
        from: 2,
        apply: subject => ({
          ...subject,
          configVersion: 3,
        }),
      },
    ])

    const config = {
      configVersion: 10,
      drink: 'water',
    }

    const migratedConfig = migrator.applyMigrations(config as any)

    expect(migratedConfig.configVersion).to.eq(10)
  })
})
