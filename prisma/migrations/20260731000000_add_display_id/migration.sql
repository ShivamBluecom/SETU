-- Add displayId to opportunities (idempotent)
IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('dbo.opportunities') AND name = 'displayId'
)
    ALTER TABLE [opportunities] ADD [displayId] NVARCHAR(1000);

-- Filtered unique index — NULL values excluded so multiple NULLs are allowed (idempotent)
IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE object_id = OBJECT_ID('dbo.opportunities') AND name = 'opportunities_displayId_key'
)
    CREATE UNIQUE INDEX [opportunities_displayId_key]
    ON [dbo].[opportunities] ([displayId])
    WHERE [displayId] IS NOT NULL;

-- Create counters table (idempotent)
IF NOT EXISTS (
    SELECT 1 FROM sys.tables WHERE name = 'counters'
)
    CREATE TABLE [dbo].[counters] (
        [name] NVARCHAR(1000) NOT NULL,
        [value] INT NOT NULL CONSTRAINT [counters_value_df] DEFAULT 0,
        CONSTRAINT [counters_pkey] PRIMARY KEY CLUSTERED ([name])
    );
