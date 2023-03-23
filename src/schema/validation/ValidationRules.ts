class CommonRules {
	FieldRequired: string = "FieldRequired"
}
class ContentTypeRules {
	NameRequired: string = "NameRequired"
	NameAlreadyExist: string = "NameAlreadyExist"
	SlugRequired: string = "SlugRequired"
	SlugAlreadyExist: string = "SlugAlreadyExist"
	SlugCannotStartWithNumber: string = "SlugCannotStartWithNumber"
	SlugCannotContainBlankSpace: string = "SlugCannotContainBlankSpace"
	SlugCannotContainSpecialCharacter: string = "SlugCannotContainSpecialCharacter"
	BaseTypeRequired: string = "BaseTypeRequired"
	SealedAndAbstractConflict: string = "SealedAndAbstractConflict"
}

class CollectionRules {
	NameRequired: string = "NameRequired"
	NameAlreadyExist: string = "NameAlreadyExist"
	SlugRequired: string = "SlugRequired"
	SlugAlreadyExist: string = "SlugAlreadyExist"
	SlugCannotStartWithNumber: string = "SlugCannotStartWithNumber"
	SlugCannotContainBlankSpace: string = "SlugCannotContainBlankSpace"
	SlugCannotContainSpecialCharacter: string = "SlugCannotContainSpecialCharacter"
	InvalidQuery: string = "InvalidQuery"
	SkipRules: string = "SkipRules"
	LimitRules: string = "LimitRules"
	ContentTypesCannotBeEmpty: string = "ContentTypesCannotBeEmpty"
}

class PageRules {
	NameRequired: string = "NameRequired"
	NameAlreadyExist: string = "NameAlreadyExist"
	SlugRequired: string = "SlugRequired"
	SlugAlreadyExist: string = "SlugAlreadyExist"
	SlugCannotStartWithNumber: string = "SlugCannotStartWithNumber"
	SlugCannotContainBlankSpace: string = "SlugCannotContainBlankSpace"
	SlugCannotContainSpecialCharacter: string = "SlugCannotContainSpecialCharacter"
	SectionCollectionRequired: string = "SectionCollectionRequired"
	SectionContentRequired: string = "SectionContentRequired"
}

class OptionsTab {
	DisplayNameRequired: string = "DisplayNameRequired"
	DisplayNameAlreadyExist: string = "DisplayNameAlreadyExist"
	FieldNameRequired: string = "FieldNameRequired"
	FieldNameAlreadyExist: string = "FieldNameAlreadyExist"
	FieldNameCannotStartWithNumber: string = "FieldNameCannotStartWithNumber"
	FieldNameCannotContainBlankSpace: string = "FieldNameCannotContainBlankSpace"
	FieldNameCannotContainSpecialCharacter: string = "FieldNameCannotContainSpecialCharacter"
}

class ValidationTab {
	HiddenAndRequiredConflict: string = "HiddenAndRequiredConflict"
	ReadonlyAndRequiredConflict: string = "ReadonlyAndRequiredConflict"
}

class RichTextRules {
	MinimumWordCountOverflow: string = "MinimumWordCountOverflow"
	MaximumWordCountOverflow: string = "MaximumWordCountOverflow"
}

class StringInputRules {
	MinimumCharacterLengthOverflow: string = "MinimumCharacterLengthOverflow"
	MaximumCharacterLengthOverflow: string = "MaximumCharacterLengthOverflow"
	ValueNotConformRegexPattern: string = "ValueNotConformRegexPattern"
	ValueNotConformRestrictRegexPattern: string = "ValueNotConformRestrictRegexPattern"
	InvalidEmailAddress: string = "InvalidEmailAddress"
	InvalidHostName: string = "InvalidHostName"
	InvalidUrl: string = "InvalidUrl"
}

class NumberInputRules {
	MinimumValueOverflow: string = "MinimumValueOverflow"
	MaximumValueOverflow: string = "MaximumValueOverflow"
	ExclusiveMinimumValueOverflow: string = "ExclusiveMinimumValueOverflow"
	ExclusiveMaximumValueOverflow: string = "ExclusiveMaximumValueOverflow"
}

class MinMaxInputRules {
	MinimumCannotBeGreaterThanMaximum: string = "MinimumCannotBeGreaterThanMaximum"
}

class EnumRules {
	EnumItemsCannotBeEmpty: string = "EnumItemsCannotBeEmpty"
}

class ArrayRules {
	ArrayItemSchemaIsRequired: string = "ArrayItemSchemaIsRequired"
	ArrayContainsInvalidItems: string = "ArrayContainsInvalidItems"
	MinimumItemCountOverflow: string = "MinimumItemCountOverflow"
	MaximumItemCountOverflow: string = "MaximumItemCountOverflow"
	ItemsMustBeUnique: string = "ItemsMustBeUnique"
}

class DateTimeRules {
	MinimumDateOverflow: string = "MinimumDateOverflow"
	MaximumDateOverflow: string = "MaximumDateOverflow"
}

class LocationRules {
	LatitudeRequired: string = "LatitudeRequired"
	LongitudeRequired: string = "LongitudeRequired"
}

class JsonRules {
	InvalidJson: string = "InvalidJson"	
}

class ProviderRules {
	DefaultRoleRequired: string = "DefaultRoleRequired"
	DefaultUserTypeRequired: string = "DefaultUserTypeRequired"
	AppClientIDRequired: string = "AppClientIDRequired"
}

class FileRules {
	MaxSizeOverflow: string = "MaxSizeOverflow"
}

export class ValidationRules {
	static CommonRules: CommonRules = new CommonRules()
	static ContentTypeRules: ContentTypeRules = new ContentTypeRules()
	static CollectionRules: CollectionRules = new CollectionRules()
	static PageRules: PageRules = new PageRules()
	static ValidationTabRules: ValidationTab = new ValidationTab()
	static OptionsTabRules: OptionsTab = new OptionsTab()
	static RichTextRules: RichTextRules = new RichTextRules()
	static StringInputRules: StringInputRules = new StringInputRules()
	static NumberInputRules: NumberInputRules = new NumberInputRules()
	static MinMaxInputRules: MinMaxInputRules = new MinMaxInputRules()
	static EnumRules: EnumRules = new EnumRules()
	static ArrayRules: ArrayRules = new ArrayRules()
	static DateTimeRules: DateTimeRules = new DateTimeRules()
	static LocationRules: LocationRules = new LocationRules()
	static JsonRules: JsonRules = new JsonRules()
	static ProviderRules: ProviderRules = new ProviderRules()
	static FileRules: FileRules = new FileRules()
}