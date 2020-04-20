export interface Migration {
  from: number | undefined
  apply: (config: any) => any
}

interface MigrationSubject {
  configVersion: number | undefined
}

export class ConfigMigrator {
  private migrations: Migration[]

  constructor(migrations: Migration[]) {
    this.migrations = migrations
  }

  public applyMigrations(subject: MigrationSubject): Partial<MigrationSubject> {
    while (this.isMigrationNecessary(subject)) {
      subject = this.applyableMigrations(subject)
        .filter(migration => migration.from === subject.configVersion)
        .reduce((currentSubject, migration) => migration.apply(currentSubject as any), subject)
    }

    return subject
  }

  public isMigrationNecessary(subject: MigrationSubject): boolean {
    return this.applyableMigrations(subject).length > 0
  }

  private applyableMigrations(subject: MigrationSubject): Migration[] {
    return this.migrations.filter(migration => migration.from === subject.configVersion)
  }
}
