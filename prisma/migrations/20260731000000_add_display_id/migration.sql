-- Add displayId to opportunities table
ALTER TABLE [opportunities] ADD [displayId] NVARCHAR(1000);

-- Filtered unique index — NULL values are excluded so multiple NULLs are allowed
CREATE UNIQUE INDEX [opportunities_displayId_key]
ON [dbo].[opportunities] ([displayId])
WHERE [displayId] IS NOT NULL;

-- Create counters table
CREATE TABLE [dbo].[counters] (
    [name] NVARCHAR(1000) NOT NULL,
    [value] INT NOT NULL CONSTRAINT [counters_value_df] DEFAULT 0,
    CONSTRAINT [counters_pkey] PRIMARY KEY CLUSTERED ([name])
);
