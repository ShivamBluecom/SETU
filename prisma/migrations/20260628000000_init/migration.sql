BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[territories] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [territories_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [territories_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[business_units] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [buType] NVARCHAR(100),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [business_units_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [business_units_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[user_business_units] (
    [userId] NVARCHAR(1000) NOT NULL,
    [buId] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [user_business_units_pkey] PRIMARY KEY CLUSTERED ([userId],[buId])
);

-- CreateTable
CREATE TABLE [dbo].[user_territories] (
    [userId] NVARCHAR(1000) NOT NULL,
    [territoryId] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [user_territories_pkey] PRIMARY KEY CLUSTERED ([userId],[territoryId])
);

-- CreateTable
CREATE TABLE [dbo].[users] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [email] NVARCHAR(1000) NOT NULL,
    [role] NVARCHAR(50) NOT NULL CONSTRAINT [users_role_df] DEFAULT 'ISR',
    [buId] NVARCHAR(1000),
    [territoryId] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [users_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [users_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [users_email_key] UNIQUE NONCLUSTERED ([email])
);

-- CreateTable
CREATE TABLE [dbo].[companies] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [address] NVARCHAR(500),
    [headOffice] NVARCHAR(1000),
    [gstNumber] NVARCHAR(50),
    [industry] NVARCHAR(1000),
    [userCount] INT,
    [linkedinUrl] NVARCHAR(1000),
    [website] NVARCHAR(1000),
    [territoryId] NVARCHAR(1000),
    [createdById] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [companies_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [companies_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[contacts] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [designation] NVARCHAR(1000),
    [email] NVARCHAR(1000),
    [phone] NVARCHAR(1000),
    [personalEmail] NVARCHAR(1000),
    [personalPhone] NVARCHAR(1000),
    [alternatePhone] NVARCHAR(1000),
    [linkedinUrl] NVARCHAR(1000),
    [companyId] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [contacts_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [contacts_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[opportunities] (
    [id] NVARCHAR(1000) NOT NULL,
    [title] NVARCHAR(1000) NOT NULL,
    [description] NVARCHAR(max),
    [value] DECIMAL(18,2) NOT NULL CONSTRAINT [opportunities_value_df] DEFAULT 0,
    [currency] NVARCHAR(1000) NOT NULL CONSTRAINT [opportunities_currency_df] DEFAULT 'INR',
    [closeDate] DATETIME2,
    [stage] NVARCHAR(50) NOT NULL CONSTRAINT [opportunities_stage_df] DEFAULT 'PROSPECTING',
    [priority] NVARCHAR(50) NOT NULL CONSTRAINT [opportunities_priority_df] DEFAULT 'MEDIUM',
    [status] NVARCHAR(50) NOT NULL CONSTRAINT [opportunities_status_df] DEFAULT 'DRAFT',
    [orderIndex] INT NOT NULL CONSTRAINT [opportunities_orderIndex_df] DEFAULT 0,
    [companyId] NVARCHAR(1000) NOT NULL,
    [primaryContactId] NVARCHAR(1000),
    [territoryId] NVARCHAR(1000),
    [createdById] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [opportunities_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [opportunities_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[line_items] (
    [id] NVARCHAR(1000) NOT NULL,
    [opportunityId] NVARCHAR(1000) NOT NULL,
    [buId] NVARCHAR(1000) NOT NULL,
    [quantity] DECIMAL(18,2),
    [unitPrice] DECIMAL(18,2),
    [totalValue] DECIMAL(18,2) NOT NULL CONSTRAINT [line_items_totalValue_df] DEFAULT 0,
    [buOwnerId] NVARCHAR(1000),
    [assignmentStatus] NVARCHAR(50) NOT NULL CONSTRAINT [line_items_assignmentStatus_df] DEFAULT 'PENDING',
    [details] NVARCHAR(max),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [line_items_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [line_items_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[service_addons] (
    [id] NVARCHAR(1000) NOT NULL,
    [opportunityId] NVARCHAR(1000) NOT NULL,
    [type] NVARCHAR(50) NOT NULL,
    [description] NVARCHAR(max),
    [value] DECIMAL(18,2) NOT NULL CONSTRAINT [service_addons_value_df] DEFAULT 0,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [service_addons_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [service_addons_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[opportunity_contacts] (
    [opportunityId] NVARCHAR(1000) NOT NULL,
    [contactId] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [opportunity_contacts_pkey] PRIMARY KEY CLUSTERED ([opportunityId],[contactId])
);

-- CreateTable
CREATE TABLE [dbo].[opportunity_pocs] (
    [id] NVARCHAR(1000) NOT NULL,
    [opportunityId] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000) NOT NULL,
    [addedById] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [opportunity_pocs_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [opportunity_pocs_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [opportunity_pocs_opportunityId_userId_key] UNIQUE NONCLUSTERED ([opportunityId],[userId])
);

-- CreateTable
CREATE TABLE [dbo].[notes] (
    [id] NVARCHAR(1000) NOT NULL,
    [content] NVARCHAR(max) NOT NULL,
    [opportunityId] NVARCHAR(1000) NOT NULL,
    [authorId] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [notes_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [notes_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[notifications] (
    [id] NVARCHAR(1000) NOT NULL,
    [opportunityId] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000) NOT NULL,
    [type] NVARCHAR(50) NOT NULL CONSTRAINT [notifications_type_df] DEFAULT 'STAGE_CHANGE',
    [stage] NVARCHAR(50),
    [read] BIT NOT NULL CONSTRAINT [notifications_read_df] DEFAULT 0,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [notifications_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [notifications_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[oem_configs] (
    [id] NVARCHAR(1000) NOT NULL,
    [buType] NVARCHAR(100) NOT NULL,
    [name] NVARCHAR(200) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [oem_configs_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [oem_configs_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[user_business_units] ADD CONSTRAINT [user_business_units_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[user_business_units] ADD CONSTRAINT [user_business_units_buId_fkey] FOREIGN KEY ([buId]) REFERENCES [dbo].[business_units]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[user_territories] ADD CONSTRAINT [user_territories_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[user_territories] ADD CONSTRAINT [user_territories_territoryId_fkey] FOREIGN KEY ([territoryId]) REFERENCES [dbo].[territories]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[users] ADD CONSTRAINT [users_buId_fkey] FOREIGN KEY ([buId]) REFERENCES [dbo].[business_units]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[users] ADD CONSTRAINT [users_territoryId_fkey] FOREIGN KEY ([territoryId]) REFERENCES [dbo].[territories]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[companies] ADD CONSTRAINT [companies_territoryId_fkey] FOREIGN KEY ([territoryId]) REFERENCES [dbo].[territories]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[companies] ADD CONSTRAINT [companies_createdById_fkey] FOREIGN KEY ([createdById]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[contacts] ADD CONSTRAINT [contacts_companyId_fkey] FOREIGN KEY ([companyId]) REFERENCES [dbo].[companies]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[opportunities] ADD CONSTRAINT [opportunities_companyId_fkey] FOREIGN KEY ([companyId]) REFERENCES [dbo].[companies]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[opportunities] ADD CONSTRAINT [opportunities_primaryContactId_fkey] FOREIGN KEY ([primaryContactId]) REFERENCES [dbo].[contacts]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[opportunities] ADD CONSTRAINT [opportunities_territoryId_fkey] FOREIGN KEY ([territoryId]) REFERENCES [dbo].[territories]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[opportunities] ADD CONSTRAINT [opportunities_createdById_fkey] FOREIGN KEY ([createdById]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[line_items] ADD CONSTRAINT [line_items_opportunityId_fkey] FOREIGN KEY ([opportunityId]) REFERENCES [dbo].[opportunities]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[line_items] ADD CONSTRAINT [line_items_buId_fkey] FOREIGN KEY ([buId]) REFERENCES [dbo].[business_units]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[line_items] ADD CONSTRAINT [line_items_buOwnerId_fkey] FOREIGN KEY ([buOwnerId]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[service_addons] ADD CONSTRAINT [service_addons_opportunityId_fkey] FOREIGN KEY ([opportunityId]) REFERENCES [dbo].[opportunities]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[opportunity_contacts] ADD CONSTRAINT [opportunity_contacts_opportunityId_fkey] FOREIGN KEY ([opportunityId]) REFERENCES [dbo].[opportunities]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[opportunity_contacts] ADD CONSTRAINT [opportunity_contacts_contactId_fkey] FOREIGN KEY ([contactId]) REFERENCES [dbo].[contacts]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[opportunity_pocs] ADD CONSTRAINT [opportunity_pocs_opportunityId_fkey] FOREIGN KEY ([opportunityId]) REFERENCES [dbo].[opportunities]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[opportunity_pocs] ADD CONSTRAINT [opportunity_pocs_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[opportunity_pocs] ADD CONSTRAINT [opportunity_pocs_addedById_fkey] FOREIGN KEY ([addedById]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[notes] ADD CONSTRAINT [notes_opportunityId_fkey] FOREIGN KEY ([opportunityId]) REFERENCES [dbo].[opportunities]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[notes] ADD CONSTRAINT [notes_authorId_fkey] FOREIGN KEY ([authorId]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[notifications] ADD CONSTRAINT [notifications_opportunityId_fkey] FOREIGN KEY ([opportunityId]) REFERENCES [dbo].[opportunities]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[notifications] ADD CONSTRAINT [notifications_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
