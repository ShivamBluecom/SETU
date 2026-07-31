-- Add displayId to opportunities table
ALTER TABLE [opportunities] ADD [displayId] NVARCHAR(1000);

-- Add unique constraint on displayId
ALTER TABLE [opportunities] ADD CONSTRAINT [opportunities_displayId_key] UNIQUE ([displayId]);

-- Create counters table
CREATE TABLE [dbo].[counters] (
    [name] NVARCHAR(1000) NOT NULL,
    [value] INT NOT NULL CONSTRAINT [counters_value_df] DEFAULT 0,
    CONSTRAINT [counters_pkey] PRIMARY KEY CLUSTERED ([name])
);
