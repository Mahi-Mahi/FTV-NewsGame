#!/usr/bin/env ruby
# encoding: utf-8

Encoding.default_external = Encoding::UTF_8
Encoding.default_internal = Encoding::UTF_8


require 'csv'
require 'unicode_utils'
require 'json'
require 'pp'
require 'zlib'
require 'fileutils'

class String
	def sanitize
		# Strip out the non-ascii character
		UnicodeUtils.nfkd(self).gsub(/(\p{Letter})\p{Mark}+/,'\\1').gsub(/[^0-9A-Za-z@\-\_]/, '-').gsub(/^\-+/, '').gsub(/\-+$/, '').gsub(/\-+/, '-').downcase
	end
end

production = false


cuits = {}

idx = 0
CSV.foreach("BDD_newsgame/Infos-Table 1.csv", :col_sep => ';') do |row|

	if idx > 0

		cuit = {}
		cuit[:id] = idx
		cuit[:source] = row[0].sanitize
		# cuit[:name] = row[1]
		cuit[:content] = row[2]
		cuit[:theme] = row[3].sanitize
		cuit[:credibility] = row[4]
		cuit[:exclusivite] = row[5]
		cuit[:article_title] = row[6]
		cuit[:article_content] = row[7]
		cuit[:avatar] = row[8]

		cuits[cuit[:id]] = cuit

	end

	idx = idx + 1

end

pp "#{cuits.length} cuits"


sources = {}

idx = 0
CSV.foreach("BDD_newsgame/Sources-Table 1.csv", :col_sep => ';') do |row|

	if row[0].nil?
		break
	end

	if idx > 0

		source = {}
		source[:id] = row[0].sanitize
		source[:name] = row[1]
		source[:bio] = row[2]
		source[:avatar] = row[3]
		source[:thematique] = []
		source[:thematique] << row[4].sanitize unless row[4].nil?
		source[:thematique] << row[5].sanitize unless row[5].nil?
		source[:credibility] = row[6].sanitize
		source[:type] = row[7].sanitize unless row[7].nil?

		sources[source[:id]] = source

	end

	idx = idx + 1

end

pp "#{sources.length} sources"


contacts = {}

idx = 0
CSV.foreach("BDD_newsgame/Contacts-Table 1.csv", :col_sep => ';') do |row|

	if row[0].nil?
		break
	end

	if idx > 0

		contact = {}
		contact[:id] = row[0].sanitize
		contact[:name] = row[0]
		contact[:bio] = row[1]
		contact[:thematique] = []
		contact[:thematique] << row[2].sanitize unless row[2].nil?
		contact[:thematique] << row[3].sanitize unless row[3].nil?
		contact[:avatar] = row[4]

		contacts[contact[:id]] = contact

	end

	idx = idx + 1

end

pp "#{contacts.length} contacts"


FileUtils.rm_rf("json/.", secure: true)
FileUtils.mkdir_p "json/"


# Cuits
filename = "json/cuits.json"
content = production ? cuits.to_json : JSON.pretty_generate(cuits)
File.open(filename, 'w') { |file| file.write content }


# Sources
filename = "json/sources.json"
content = production ? sources.to_json : JSON.pretty_generate(sources)
File.open(filename, 'w') { |file| file.write content }



# Contacts
filename = "json/contacts.json"
content = production ? contacts.to_json : JSON.pretty_generate(contacts)
File.open(filename, 'w') { |file| file.write content }



FileUtils.rm_rf("../app/data", secure: true)
FileUtils.mkdir_p "../app/data"
FileUtils.cp("json/cuits.json", "../app/data/cuits.json")
FileUtils.cp("json/sources.json", "../app/data/sources.json")
FileUtils.cp("json/contacts.json", "../app/data/contacts.json")
