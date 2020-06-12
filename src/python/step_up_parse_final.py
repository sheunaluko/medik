import re # regex
import json

###############
## FUNCTIONS ##
###############

#################################################
# Functions to locate headers and disease names #
#################################################

# identify the caps lock section headers in the book from the master_array
# the headers are stored in header_bank in the
# format: "Diseases Of The Cardiovascular System"

def get_headers():
    global header_regex
    global header_bank

    for line in master_array:
        if re.match(header_regex, line):

            if(line[1] == " "): # if 1 digit number precedes header
                header_bank.append(line[2:-1].lower().title())

            else: # if 2 digit number precedes header
                header_bank.append(line[3:-1].lower().title())

# function that searches for the section headers as defined in header_bank
# and stores the location of each header in the dictionary header_locations
# key = header | value = [line number, section #]
def get_header_locations():
    global header_locations
    global section_counter
    global header_demarcation

    for line in master_array:
        for header in header_bank:
            if header.lower()[:30] == line.rstrip().lower()[:30]: # only match first 30 chars due to line breaks
                location = master_array.index(line)
                section = section_counter
                header_locations[header] = [location, section]
                section_counter += 1
                header_demarcation.append(location)

# function that identifies the section of the book where diseases are
# no longer enumerated and the search should stop
# this is marked by the the "questions" portion of the book
# by not searching for diseases beyond this point, accidentally
# picking up diseases in the index is avoided
def get_endpoint_location():
    global endpoint_location

    for line in master_array:
        if re.search(endpoint_regex, line):
            location = master_array.index(line)
            endpoint_location = location

# fucntion that searches for disease names and stores
# the location of deach disease in the dictionary disease_locations
# key = disease name | value = [line number, section #] section = None for outside heading areas
def get_diseases():
    global disease_locations
    global disease_demarcation
    global endpoint_location
    global excluded_substrings_disease_names
    global excluded_disease_names

    for line in master_array:

        if re.search(disease_name_regex, line):
            location = master_array.index(line)

            if not any(substring in line for substring in excluded_substrings_disease_names): # removes Quick HIT, FIGURE, etc
                if line not in excluded_disease_names: # removes mis-identified disease names like Sodium

                    if len(line) < 30: # remove sentences
                        if location < endpoint_location:
                            disease = line[1:-1] # trims off /x0c and /n
                            location = master_array.index(line)
                            section = determine_section(location)
                            if section != None:
                                disease_locations[disease] = [location, section]
                                disease_demarcation.append(location)


# helper function
def determine_section(location):
    if location > header_demarcation[0] and location < header_demarcation[1]:
        return 1
    if location > header_demarcation[1] and location < header_demarcation[2]:
        return 2
    if location > header_demarcation[2] and location < header_demarcation[3]:
        return 3
    if location > header_demarcation[3] and location < header_demarcation[4]:
        return 4
    if location > header_demarcation[4] and location < header_demarcation[5]:
        return 5
    if location > header_demarcation[5] and location < header_demarcation[6]:
        return 6
    if location > header_demarcation[6] and location < header_demarcation[7]:
        return 7
    if location > header_demarcation[7] and location < header_demarcation[8]:
        return 8
    if location > header_demarcation[8] and location < header_demarcation[9]:
        return 9
    if location > header_demarcation[9] and location < header_demarcation[10]:
        return 10
    if location > header_demarcation[10]:
        return 11


################################################
# Functions to populate the disease dictionary #
################################################

# function that takes in the start location (line the disease name is on) and end location
# (line before the next disease) and extracts information about the disease
# the information is then added to disease_dictionary, the final repository
# key = disease name | value = [section, line #, general information, diagnostic information]

def get_disease_info(disease):
    global disease_dictionary
    global disease_locations

    start_location = disease_locations[disease][0] # line of the disease name
    end_location = get_end_location(start_location) # line before the next disease name

    general_information = get_general_information(start_location, end_location)
    cleaned_general_information = clean(general_information)

    diagnostic_information = get_diagnostic_information(start_location, end_location)
    cleaned_diagnostic_information = clean(diagnostic_information)

    section = disease_locations[disease][1]

    if section != None: # check to remove anything mis-isdentified outside the sections
        disease_dictionary[disease] = [section, start_location, cleaned_general_information, cleaned_diagnostic_information]


# helper function
# given the index of a disease, find the index one before the next disease
def get_end_location(start_location):
    global disease_demarcation

    # find the start location in the disease_demarcation array
    start_location_index = disease_demarcation.index(start_location)
    end_location_value = 0
    # end check on the array
    if start_location_index != (len(disease_demarcation) - 1):
        end_location_index = start_location_index + 1
        end_location_value = disease_demarcation[end_location_index] - 1

    return end_location_value

# helper function
def end_of_sub_section(line):
    global sub_section_endpoints_regex

    if re.search(newline_regex, line): # check for a lone newline character
        return True
    if re.search(new_sub_section_regex,line): # check for a new subsection header i.e. "B. Clinical Features\n"
        return True
    for regex in sub_section_endpoints_regex:
        if re.search(regex, line):
            return True
    else:
        return False


##########################################################
# Functions to populate information for the sub sections #
##########################################################

# these functions take in start and end which demarkate the start and end of information about a disease
# start refers to the line in the master_array where the disease name is located
# end refers to the line in the master_array before the next disease name is located
# uses a bool to see if the sub section has been found
# returns a string with the sub section information
# terminates adding to the string when an end_of_sub_section is identified

# general information
def get_general_information(start, end):
    global general_sub_section

    sub_section_identified = False
    to_return = ""

    for line in master_array[start:end]:
        if general_sub_section in line:
            sub_section_identified = True
            continue

        if sub_section_identified:
            # the desired sub section has been found
            if not end_of_sub_section(line):
                # the content of the sub section continues
                to_return = to_return + line
            else:
                break # exit the for loop and stop reading
    return to_return

# diagnostic information
def get_diagnostic_information(start, end):
    global diagnostic_sub_section

    sub_section_identified = False
    to_return = ""

    for line in master_array[start:end]:
        if diagnostic_sub_section in line:
            sub_section_identified = True
            continue

        if sub_section_identified:
            # the desired sub section has been found
            if not end_of_sub_section(line):
                # the content of the sub section continues
                to_return = to_return + line
            else:
                break # exit the for loop and stop reading
    return to_return


# removes (see Table) (see Figure) and paragraph breaks "\x0c"
def clean(string):
    global references_regex
    string = re.sub(references_regex, '', string)
    string = re.sub(r'\x0c', '', string)
    return string

#############
## STORAGE ##
#############

# stores every line in the book in order
master_array = []

# a list of all the identified section headers after reading master_array
# and searching for caps lock headers (found in the contents section of the book)
# header format: "Diseases Of The Cardiovascular System"
header_bank = []

# dictionary that stores the location of each section header
# key = header | value = [line number, section #]
# header format: "Diseases Of The Cardiovascular System"
header_locations = {}

# tracks the start of each section in the book, starting with section 1 # 299
# used to determine section for each disease
header_demarcation = []

# a dictionary that holds all disease names and locations as an index in master_array
# index is the line the disease name falls on
# key = disease name | value = [line number, section #] section = None for outside heading areas
disease_locations = {}

section_counter = 1

# final product
# key = disease name | value = [section, line #, general information, diagnostic information]
disease_dictionary = {}

# tracks the indices of all diseases #60
disease_demarcation = []

# marks the beginning of the "Questions" portion of the book
# no new disease information found beyond that point
# identified by the function get_endpoint_location()
endpoint_location = -1

#############
## REGEXES ##
#############

# identifies headers
# ['1 DISEASES OF THE CARDIOVASCULAR SYSTEM\n']
header_regex = '\d{1,2}.*(DISEASE|DISORDER|MEDICINE).*'

# identifies disease names
disease_name_regex = '^\f[A-Z]([a-z]|[A-Z]|[\(]|[\)]|[\-]|[\s])*\n$'

# identifies a lone newline character for determining the end of a sub section
# i.e. "\n"
newline_regex = '^\n$'

# identifies a sub section header for determining the end of a sub section
# i.e. "B. Clinical Features"
new_sub_section_regex = '^[A-Z]\.\s[A-Z]([a-z]|[A-Z]|\s|[\(]|[\)]|[\-])*$'

# identifies references in parentheses that won't be relevant outside of book context
# i.e. (Table 1-1) (see also Clinical Pearl 1-7) (Figure 1-5)
references_regex = '\(.*(Figure|Table|Clinical Pearl|see).*\)'

# identifies endpoint marker
endpoint_regex = '^\f(Questions)\n$'

# used to remove accidentally-identified disease names
excluded_substrings_disease_names = ['FIGURE', 'Quick HIT', 'Miscellaneous']

# used to remove accidentally-identified disease names
excluded_disease_names = ['\fOverview\n', '\fSodium\n', '\fCalcium\n', '\fPotassium\n', '\fPhosphate\n', '\fSelection Bias\n', '\fCABG)\n', '\fReferences\n', '\fInfections\n', '\fInfectious\n']

# marks the end of a subsection
sub_section_endpoints_regex = ['Quick HIT\n', 'CLINICAL PEARL', 'TABLE']

# identifies a general sub section i.e. A. General Characteristics
general_sub_section = ". General Characteristics"

# identifies a diagnostic sub section i.e. D. Diagnosis
diagnostic_sub_section = ". Diagnosis"

##########
## MAIN ##
##########

with open("step_up_original.txt", "r") as file1:

    # read the entire book into the master_array
    for line in file1:
        master_array.append(line)

    # identify the headers in the book from the master_array
    get_headers()

    # identify the index of each header in the master_array
    get_header_locations()

    # identify the section of the book where diseases are no longer enumerated and the search should stop
    get_endpoint_location()

    # fucntion that searches for disease names and stores their locations
    get_diseases()

    # iterate through each disease and populate the disease dictionary with information
    for disease in disease_locations:
        get_disease_info(disease)

####################
## EXPORT TO JSON ##
###################

with open('data.json', 'w') as fp:
    json.dump(disease_dictionary, fp,  indent=4)
